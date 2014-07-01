var mapregister = global.MapRegistry;

function ApplyIF(o, c, defaults) { // == override
	// no "this" reference for friendly out of scope calls
	if (defaults) {
		ApplyIF(o, defaults);
	}
	if (o && c && typeof c == 'object') {
		for (var p in c) {
			if (c[p])
				o[p]=c[p];
		}
	}
	return o;
}

function DomainObject(table) {
	//console.log("....newDomainObject");
	//this.created='';
	this.table=table;
	this.created = new Date();
	this.id = mapregister.genID();
	this.version = 0;
	this.tmpDatas = {};
	this.orignDatas = {};
	this.datas = {};
	return this;
}
exports.DomainObject = DomainObject;
//DomainObject.prototype.markClean=function(key) {
//	mapregister.getUnitOfWork(key).registerClean(this);
//}
DomainObject.prototype.markNew=function(key) {
	mapregister.getUnitOfWork(key).registerNew(this);
}
DomainObject.prototype.markRemoved=function(key) {
	mapregister.getUnitOfWork(key).registerRemoved(this);
}
DomainObject.prototype.markDirty=function(key) {
	mapregister.getUnitOfWork(key).registerDirty(this);
}

DomainObject.prototype.flush=function() {
	mapregister.getMapper(this.table).flush(this);
}
DomainObject.prototype.rollback=function() {
	ApplyIF(this.orignDatas, this.tmpDatas);
	this.tmpDatas=[];
	//this.markClean();
}
DomainObject.prototype.commit=function() {
	ApplyIF(this.tmpDatas, this.orignDatas);
	ApplyIF(this.orignDatas, this.datas);
	this.datas=[];
	this.tmpDatas=[];
	//this.markClean();
}
DomainObject.prototype.setCreated=function(c) { 
	this.created=c?c:new Date();
}
DomainObject.prototype.setModified=function(c) { 
	this.modified=c?c:new Date();
}
DomainObject.prototype.setOrign=function(column,value) {
	if (",ID,MODIFIED,MODIFIEDBY,CREATED,CREATEDBY,VERSION,".indexOf(","+column+",")>=0)
		throw {message:"不合法的设置:"+column};
	this.orignDatas[column]=value;
}
DomainObject.prototype.getOrign=function(column) {
	return this.orignDatas[column];
}
DomainObject.prototype.set=function(column, value) {
	if (",ID,MODIFIED,MODIFIEDBY,CREATED,CREATEDBY,VERSION,".indexOf(","+column+",")>=0)
		throw {message:"不合法的设置:"+column};
	this.datas[column]=value;
}
DomainObject.prototype.get=function(column) {
	if (!this.datas[column]) {
		return this.orignDatas[column];
	}
	return this.datas[column];
}