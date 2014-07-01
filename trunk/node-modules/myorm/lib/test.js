function Test(args) {
  console.log("......newTest:"+args);
  return this;
}
//util.inherits(Test, EventEmitter);
exports.Test = Test;
Test.prototype.printA = function(args) {
    console.log("......printA:"+args);
}