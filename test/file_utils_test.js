
var fh = require("../lib/utils/file_utils.js");
var fs  = require("fs");

module.exports = {
	

	insertPid: function(test){
		var path ="/tmp/test.pid";
		fh.upsertPid(12312,path);
		var pid = fs.readFileSync(path);
		test.equals(12312,parseInt(pid));
		fs.unlinkSync(path);
		test.done();
	},

	updatePid: function(test){
		var path ="/tmp/test.pid";
		fs.writeFileSync(path,"4545");
		fh.upsertPid(12312,path);
		var pid = fs.readFileSync(path);
		test.equals("4545,12312",pid);
		fs.unlinkSync(path);
		test.done();
	},

	getPids: function(test){
		var path = "/tmp/test.pid";
		fs.writeFileSync(path,"12312,12312,123");
		var pids = fh.getPids(path);
		test.equals(pids.length,3);
		test.equals(pids[0],"12312");
		fs.unlinkSync(path);
		test.done();
	}
	
}