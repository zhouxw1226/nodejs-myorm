
var MyORM = require('myorm');
myORM = new MyORM(); // ����ORM���棨�Դ�ORM���桢DBӳ�䡢�����ֹ����ͱ������������ܡ���
myORM.registerREDIS('127.0.0.1',6379); // ע�Ỻ����
myORM.registerJDBC('127.0.0.1',3306,'root','','test'); // ע��JDBC
myORM.registerMapper(
	'customer', // ע��ӳ����
	myORM.createMapper('customer', ['NAME','PHONE','ADDRESS']) // ����ӳ����
); 
function test(_sessionid){
	// sessionid������table���ǾͲ��ܴ���session��������������
	myORM.transaction(_sessionid, function(sessionid, worker) {
		var mapper = myORM.getMapper('customer'); // ��ȡע�����ӳ����
		// find
		mapper.find(1, sessionid, function(err, object){ // ����id=11415�ļ�¼
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