require('./mapperregistry');
var mapregister = global.MapRegistry; // ����ע����
require('./cache');
var cacheclient = global.CACHE; // ��������

var UnitOfWork = require('./unitofwork').UnitOfWork; // Session������Ԫ
var Mapper = require('./map').Mapper; // Mapperӳ����
// ����ORM����
function ORM() {
    //console.log(".newOrm");
    return this;
}
exports.ORM = ORM;

ORM.prototype.setCache = function(table, obj) {
    cacheclient.set(table, obj);
}
ORM.prototype.getCache = function(table, id) {
    return cacheclient.get(table, id);
}

ORM.prototype.createMapper = function(table, columns) {
	return new Mapper(table, columns);
}
ORM.prototype.registerMapper = function(key, mapper) {
	mapregister.registerMapper(key, mapper);
}
ORM.prototype.getMapper = function(key) {
	return mapregister.getMapper(key);
}

ORM.prototype.registerREDIS = function(host,port) {
	mapregister.registerREDIS(host,port);
}
ORM.prototype.getREDIS = function() {
	return mapregister.getREDIS();
}

ORM.prototype.registerJDBC = function(host,port,user,pass,database) {
	mapregister.registerJDBC(host,port,user,pass,database);
}
ORM.prototype.getJDBC = function() {
	return mapregister.getJDBC();
}

ORM.prototype.end = function(sessionid) {
	var worker = mapregister.getUnitOfWork(sessionid);
	try {
		worker.commit();
	}
	catch(E) {
		worker.rollback();
		throw E;
	}
	finally{
		mapregister.unregisterUnitOfWork(sessionid);
	}
}
ORM.prototype.transaction = function(sessionid,callback) {
	var worker = new UnitOfWork(sessionid);
	try {
		mapregister.registerUnitOfWork(sessionid, worker);
		callback(sessionid, worker);
	}
	catch(E){
		worker.rollback();
		mapregister.unregisterUnitOfWork(sessionid);
		throw E;
	}
}