var mapregister = global.MapRegistry;
var cacheclient = global.CACHE;

var DomainObject = require('./domainobject').DomainObject;
var Async = require('async');
var MySQL = require('mysql');
var MySQLQueues = require('mysql-queues');
/*
var jdbc = MapRegister.getJDBC();
var mysqlpool = MySQL.createPool({ 
    host: jdbc.host,
    user: jdbc.user,
    password: jdbc.pass,
    database:jdbc.database,
    port: jdbc.port
});
*/
function Mapper(table, columns) {
	console.log("...newMapper");
	this.table = table;
	this.columns = columns;
	//this.selectSQL='';
	//this.insertSQL='';
	//this.updateSQL='';
	//this.deleteSQL='';
	this.buildStatements();
	return this;
}
exports.Mapper = Mapper;
Mapper.prototype.buildStatements=function() {
	var columnsSQL='', valueSQL='', updateSQL='';
	for (var i=0;i<this.columns.length;i++) {
		if (i>0) {
			columnsSQL+=',';
			valueSQL+=',';
			updateSQL+=',';
		}
		columnsSQL+=this.columns[i];
		valueSQL+='?';
		updateSQL+=this.columns[i]+'=?';
	}
	this.idcolumn = this.getIdColumn();
	this.selectSQL = "select "+columnsSQL+",CREATEDBY,CREATED,MODIFIEDBY,MODIFIED,VERSION,"+this.idcolumn+" from "+this.table
			+" where "+this.idcolumn+"=? ";
	this.insertSQL = "insert into "+this.table 
			+"("+columnsSQL+",CREATEDBY,CREATED,MODIFIEDBY,MODIFIED,VERSION,"+this.idcolumn+") values ("+valueSQL+",?,?,?,?,?,?)";
	this.updateSQL = "update "+this.table+" set "+updateSQL+",MODIFIEDBY=?,MODIFIED=?,VERSION=? "
			+" where "+this.idcolumn+"=? and VERSION=? ";
	this.deleteSQL = "delete from "+this.table
			+" where "+this.idcolumn+"=? and VERSION=? ";
	this.checkVersionSQL = "select VERSION,MODIFIEDBY,MODIFIED from "+this.table
			+" where "+this.idcolumn+"=? ";
}
Mapper.prototype.getIdColumn=function() {
	return 'ID';
} 
Mapper.prototype.createDomainObject=function() {
	return new DomainObject(this.table);
}
Mapper.prototype.getJDBCConnection=function(){
	var JDBC = mapregister.getJDBC();
	var conn = MySQL.createConnection({ 
		host: JDBC.host,
		user: JDBC.user,
		password: JDBC.pass,
		database: JDBC.database,
		port: JDBC.port
	});
	return conn;
}
Mapper.prototype.getJDBCPool=function(){
	var JDBC = mapregister.getJDBC();
	if (!global.JDBCPOOL) {
		global.JDBCPOOL = MySQL.createPool({ 
			host: JDBC.host,
			user: JDBC.user,
			password: JDBC.pass,
			database: JDBC.database,
			port: JDBC.port
		});
		console.log('>>>>>>>>>>>>>>>>>>global.createPool');
	}
	return global.JDBCPOOL;
}
Mapper.prototype.flush=function(obj) {
	cacheclient.set(this.table, obj);
}
Mapper.prototype.remove=function(obj, sessionid, callback) { 
	{
		console.log('.........db.mapper.removing');
		//var uow = mapregister.getUnitOfWork(sessionid), scope = this;
		//var conn = uow.getConnection();
		var pool = this.getJDBCPool(), scope = this;
		pool.getConnection(function(err, conn) 
		//var conn = this.getJDBCConnection(), scope = this;
			{
				//if (err) console.log(".........POOL ==> " + err);
				console.log("==>"+scope.deleteSQL);
				conn.query(scope.deleteSQL,[obj.id,obj.version],function(err,rows,fields){
					if (err) console.log(err);
					//conn.release();
					//conn.commit();
					//conn.end();
					//console.log('End Connecting to MySQL.........');
					cacheclient.remove(this.table, obj);
					if (callback)
						callback(err,obj);
					scope=null;
				});
			}
		);
	}
}
Mapper.prototype.insert=function(obj, sessionid, callback) { 
	{
		console.log('.........db.mapper.inserting');
		//var uow = mapregister.getUnitOfWork(sessionid), scope = this;
		//var conn = uow.getConnection();
		var pool = this.getJDBCPool(), scope = this;
		pool.getConnection(function(err, conn) 
		//var conn = this.getJDBCConnection(), scope = this;
			{
				//if (err) console.log(".........POOL ==> " + err);
				var values = [], columns = scope.columns;
				obj.commit();
				obj.setCreated();
				obj.setModified();
				obj.createdby=sessionid;
				obj.modifiedby=sessionid;
				for (var i=0;i<columns.length;i++) {
					values.push(obj.get(columns[i]));
				}
				//createdby,created,modifiedby,modified,version,id
				values.push(obj.createdby);
				values.push(obj.created);
				values.push(obj.modifiedby);
				values.push(obj.modified);
				values.push(obj.version);
				values.push(obj.id);
				console.log("==>"+scope.insertSQL+','+values);
				conn.query(scope.insertSQL,values,function(err,rows,fields){
					if (err) console.log(err);
					//conn.release();
					//conn.commit();
					//conn.end();
					//console.log('End Connecting to MySQL.........');
					cacheclient.set(scope.table, obj);
					if (callback)
						callback(err,obj);
					scope=null;
				});
			}
		);
	}
}
Mapper.prototype.update=function(obj, sessionid, callback) { 
	{
		console.log('.........db.mapper.updating');
		//var uow = mapregister.getUnitOfWork(sessionid), scope = this;
		//var conn = uow.getConnection();
		var pool = this.getJDBCPool(), scope = this;
		pool.getConnection(function(err, conn) 
		//var conn = this.getJDBCConnection(), scope = this;
			{
				//if (err) console.log(".........POOL ==> " + err);
				var values = [], columns = scope.columns;
				obj.commit();
				obj.setModified();
				obj.modifiedby=sessionid;
				for (var i=0;i<columns.length;i++) {
					values.push(obj.get(columns[i]));
				}
				//modifiedby,modified,version,id
				values.push(obj.modifiedby);
				values.push(obj.modified);
				values.push(obj.version);
				values.push(obj.id);
				values.push(obj.id);
				values.push(obj.version);
				console.log("==>"+scope.updateSQL+','+values);
				conn.query(scope.updateSQL,values,function(err,rows,fields){
					if (err) console.log(err);
					//conn.release();
					//conn.commit();
					//conn.end();
					//console.log('End Connecting to MySQL.........');
					cacheclient.set(scope.table, obj);
					if (callback)
						callback(err,obj);
					scope=null;
				});
			}
		);
	}
}
Mapper.prototype.query=function(sql, values, sessionid, callback){
	//query(sql, values)
}
Mapper.prototype.find=function(id, sessionid, callback) {
	var obj = cacheclient.get(this.table, id);
	if (obj) {
		console.log('.........cache.mapper.finding:'+obj.id);
		callback(null, obj);
		//return obj;
	} else {
		console.log('.........db.mapper.finding');
		//var uow = mapregister.getUnitOfWork(sessionid), scope = this;
		//var conn = uow.getConnection();
		var pool = this.getJDBCPool(), scope = this;
		pool.getConnection(function(err, conn) 
		//var conn = this.getJDBCConnection(), scope = this;
			{
				//if (err) console.log("...POOL ==> " + err);
				console.log("==>"+scope.selectSQL);
				conn.query(scope.selectSQL,[id],function(err,rows,fields){
					if (err) console.log(err);
					//conn.release();
					//conn.commit();
					//conn.end();
					//console.log('End Connecting to MySQL...');
					if (rows && rows.length>0) {
						var row = rows[0];
						obj = scope.createDomainObject(), columns = scope.columns;
						for (var i=0;i<columns.length;i++) {
							obj.setOrign(columns[i], row[columns[i]]);
						}
						scope.loadSystemFields(obj, row);
					}
					cacheclient.set(scope.table, obj);
					if (callback)
						callback(err,obj);
					scope=null;
				});
			}
		);
	}
} 
Mapper.prototype.loadSystemFields=function(obj, row) {
	var createdBy = row['CREATEDBY'];
	var created = row['CREATED'];
	var modifiedBy = row['MODIFIEDBY'];
	var modified = row['MODIFIED'];
	var version = row['VERSION'];
	var id = row[this.getIdColumn()];
	//obj.setSystemFields(modifiedBy, modified, version);
	obj.createdBy=createdBy;
	obj.created=created;
	obj.modifiedBy=modifiedBy;
	obj.modified=modified;
	obj.version=version;
	obj.id=id;
}
	//);
	/*
	var pool = this.getJDBCPool();
	if (!pool)
		throw {message:'Pool not defined'};
	console.log("...pool:"+pool);
	pool.getConnection(function(conn){
		conn.release();
	});
	*/
	/*
	var jdbc = mapregister.getJDBC();
	var conn = MySQL.createConnection({
		host: jdbc.host,
		user: jdbc.user,
		password: jdbc.pass,
		database: jdbc.database,
		port: jdbc.port
	});
	console.log("...conn:"+conn);
	conn.connect();
	// 获取事务
	MySQLQueues(conn);
	// 开启事务
	var trans = conn.startTransaction(), scope=this;
	Async.series([
		function(update_cb) { 
			// 执行第一条sql语句 如果出错 直接进入最后的 错误方法 回滚事务
			console.log('updateSQL:'+scope.updateSQL);
			trans.query(scope.updateSQL, [id], function(err, info) {
				console.log(info);
				update_cb(err, info);
				scope = null;
			})
		}
	], function(err, info) {
		if (err) {
			console.log("rollback", err);
			// 出错的场合 回滚
			trans.rollback();
		} else {
			console.log("commit");
			// 没有错误的场合 提交事务
			trans.commit();
		}
	});
	// 执行这个事务
	trans.execute();
	conn.end();
	*/