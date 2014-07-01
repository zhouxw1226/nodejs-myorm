var MAPPING={}; // global
var UNITOFWORK={}; // global
var REDIS={}; // global
var JDBC={}; // global
var JDBCPOOL;

function MapRegistry() {
  console.log("...newMapRegistry");
  return this;
}
exports.MapRegistry = MapRegistry;
global.MapRegistry = new MapRegistry();
MapRegistry.prototype.registerMapper=function(key, mapper) {
	MAPPING[key]=mapper;
	return MAPPING;
}
MapRegistry.prototype.getMapper=function(key) {
	return MAPPING[key];
}
MapRegistry.prototype.unregisterMapper=function(key) {
	UNITOFWORK[key]=null;
}

MapRegistry.prototype.registerUnitOfWork=function(key, unitofwork) {
	UNITOFWORK[key]=unitofwork;
	return UNITOFWORK;
}
MapRegistry.prototype.getUnitOfWork=function(key) {
	return UNITOFWORK[key];
}
MapRegistry.prototype.unregisterUnitOfWork=function(key) {
	UNITOFWORK[key]=null;
}

MapRegistry.prototype.registerREDIS=function(host,port){
	REDIS={host:host,port:port};
} 
MapRegistry.prototype.getREDIS=function(){
	return REDIS;
}
MapRegistry.prototype.registerJDBC=function(host,port,user,pass,database) {
	JDBC = {host:host,port:port,user:user,pass:pass,database:database};
}
MapRegistry.prototype.getJDBC=function(){
	return JDBC;
}

MapRegistry.prototype.genID=function(){ // table
	var date = new Date();
	var result,year,month,day;
	year = date.getYear() + 1900;
	month = date.getMonth() + 1;
	day = date.getDate();
	result = year.toString() + (month>9?month:'0'+month) + (day>9?day:'0'+day);
	return parseInt(result+'00'+Math.round(Math.random()*1000)); // ÁÙÊ±Ğ´·¨
}