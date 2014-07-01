var mapregister = global.MapRegistry;

function UnitOfWork(sessionid) {
	console.log("......newUnitOfWork:"+sessionid);
	this.sessionid = sessionid;
	this.news = [];
	this.dirties = [];
	this.removeds = [];
	this.reads = [];
	return this;
}
exports.UnitOfWork = UnitOfWork;

UnitOfWork.prototype.rollback=function() {
	console.log('......worker.rollback');
}
UnitOfWork.prototype.commit=function() {
	console.log('......worker.commiting');
	
	this.insertNew();
	this.deleteRemoved();
	this.updateDirty();
	
	this.news=[];
	this.dirties=[];
	this.removeds=[];
	
	console.log('......worker.commited');
}

UnitOfWork.prototype.registerNew=function(object) {
	for (var k=0;k<this.news.length;k++) {
		if (this.news[k]==object)
			return this.news;
	}
	console.log('......worker.registerNew.id:'+object.id);
	this.news.push(object);
	return this.news;
}
UnitOfWork.prototype.registerDirty=function(object) {
	for (var k=0;k<this.dirties.length;k++) {
		if (this.dirties[k]==object) {
			return this.dirties;
		}
	}
	console.log('......worker.registerDirty.id:'+object.id);
	this.dirties.push(object);
	return this.dirties;
}
UnitOfWork.prototype.registerRemoved=function(object) {
	for (var k=0;k<this.removeds.length;k++) {
		if (this.removeds[k]==object)
			return this.removeds;
	}
	console.log('......worker.registerRemoved.id:'+object.id);
	this.removeds.push(object);
	return this.removeds;
}
UnitOfWork.prototype.registerRead=function(object) {
	for (var k=0;k<this.reads.length;k++) {
		if (this.reads[k]==object)
			return this.reads;
	}
	console.log('......worker.registerRead.id:'+object.id);
	this.reads.push(object);
	return this.reads;
}


UnitOfWork.prototype.updateDirty=function() {
	for (var i=0;i<this.dirties.length;i++) {
		var object = this.dirties[i];
		if (object && object.table) {
			console.log('......worker.updateDirty');
			mapregister.getMapper(object.table).update(object, this.sessionid);
		}else{
			throw {message:'unsupport updated domainobject'}
		}
	}
}
UnitOfWork.prototype.deleteRemoved=function() {
	for (var i=0;i<this.removeds.length;i++) {
		var object = this.removeds[i];
		if (object && object.table) {
			console.log('......worker.deleteRemoved');
			mapregister.getMapper(object.table).remove(object, this.sessionid);
		}else{
			throw {message:'unsupport removed domainobject'}
		}
	}
}
UnitOfWork.prototype.insertNew=function() {
	for (var i=0;i<this.news.length;i++) {
		var object = this.news[i];
		if (object && object.table) {
			console.log('......worker.insertNew');
			mapregister.getMapper(object.table).insert(object, this.sessionid);
		}else{
			throw {message:'unsupport insert domainobject'}
		}
	}
}
UnitOfWork.prototype.checkConsistentReads=function() {
	for (var i=0;i<this.reads.length;i++) {
		var object = this.reads[i];
		if (object) {
			console.log(".....worker.id:"+object.id+",addVersion:"+object.version++);
		}else{
			throw {message:'unsupport checkConsistentReads domainobject'}
		}
	}
}

