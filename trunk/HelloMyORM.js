
var MyORM = require('myorm');
myORM = new MyORM(); // 构造ORM引擎（自带ORM缓存、DB映射、离线乐观锁和悲观锁、事务不能～）
myORM.registerREDIS('127.0.0.1',6379); // 注册缓存框架
myORM.registerJDBC('127.0.0.1',3306,'root','','test'); // 注册JDBC
myORM.registerMapper(
	'customer', // 注册映射类
	myORM.createMapper('customer', ['NAME','PHONE','ADDRESS']) // 创建映射类
); 
function test(_sessionid){
	// sessionid可以是table，那就不能处理session级别隔离的事务处理
	myORM.transaction(_sessionid, function(sessionid, worker) {
		var mapper = myORM.getMapper('customer'); // 获取注册过的映射类
		// find
		mapper.find(1, sessionid, function(err, object){ // 查找id=11415的记录
			console.log('####  find.object:'+object.get('PHONE')+','+object.get('NAME')+','
				+object.get('ADDRESS')+','+object.version+','+object.id);
			// update
			object.set('ADDRESS','ADD_'+Math.round(Math.random()*100000)+'_RESS');
			//console.log('####  markDirty');
			object.markDirty(sessionid);
			/*mapper.update(object,sessionid,function(err, object){
				console.log('####update.address:'+object.get('ADDRESS'));
			});*/
			
			// new
			var object3 = mapper.createDomainObject(); 
			object3.set('NAME','zhouxw');
			object3.set('PHONE','33513689');
			object3.set('ADDRESS','anting');
			object3.markNew(sessionid);
			object3.flush();

			// find
			mapper.find(object3.id, sessionid, function(err2, object2){
				console.log('####  find.object2:'+object2.get('PHONE')+','+object2.get('NAME')
						+','+object2.get('ADDRESS')+','+object2.version+','+object2.id);
				// update
				object2.set('ADDRESS','changning');
				console.log('####  markDirty');
				object2.markDirty(sessionid);
				myORM.end(sessionid);
			});
		});
	});
	//res.send("<ul><li>OK</li></ul>");
};
test('admin');