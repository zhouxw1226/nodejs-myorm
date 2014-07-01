var mapregister = global.MapRegistry;

var REDIS = mapregister.getREDIS();
var Redis = require('redis');
var redisclient = Redis.createClient(REDIS.port, REDIS.host);//(6379, '127.0.0.1');
//redisclient.set(filename, data, redisclient.print);
/*redisclient.get(filename, function(err, reply) { // get entire file
	if (err) {
		console.log("Get error: " + err);
		redisclient.end();
	} else {
		fs.writeFile("duplicate_" + filename, reply, function(err) {
			if (err) {
				console.log("Error on write: " + err)
			} else {
				console.log("Write " + reply.length + " bytes to filesystem.");
				console.log("File written.");
			}
			redisclient.end();
		});
	}
});*/
function Cache() {
  console.log("...newCache");
  return this;
}
exports.Cache = Cache;
global.CACHE=new Cache();
global.LOCALCACHE = {}; // ¡Ÿ ±¥¶¿Ì
Cache.prototype.remove = function(table, obj) {
	table=table.toUpperCase();
    console.log("......Cache.removeCaching:"+table+","+obj);
	if (!global.LOCALCACHE[table]) {
		global.LOCALCACHE[table]={};
	}
	global.LOCALCACHE[table][obj.id]=null;
	delete global.LOCALCACHE[table][obj.id];
	redisclient.set(table+'_'+obj.id, null);
}
Cache.prototype.set = function(table, obj) {
	table=table.toUpperCase();
    console.log("......Cache.setCaching:"+table+","+obj);
	if (!global.LOCALCACHE[table]) {
		global.LOCALCACHE[table]={};
	}
	global.LOCALCACHE[table][obj.id]=obj;
	//redisclient.set(table+'_'+obj.id, null);
	redisclient.set(table+'_'+obj.id, obj, redisclient.print);
}
Cache.prototype.get = function(table, id) {
	table=table.toUpperCase();
    console.log("......Cache.getCaching:"+table+","+id);
	if (!global.LOCALCACHE[table]) {
		global.LOCALCACHE[table]={};
	}
	var obj = global.LOCALCACHE[table][id];
	if (obj) 
		return obj;
	redisclient.get(table+'_'+id, function(err, reply) { 
		if (err) {
			console.log("......getCached error: " + err);
		} else {
			if (reply)
				global.LOCALCACHE[table][id]=reply;
		}
	});
}