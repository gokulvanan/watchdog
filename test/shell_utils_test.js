
var sh = require("../lib/utils/shell_utils.js");

module.exports = {
	

	echoTest: function(test){
		var obj ={cmd:"echo", args:["hi"]};
		sh.spawn(obj,function(err,msg){
			// test.ok(true);
			test.equals("hi\n",msg);
			test.done();
		});
	},

	pipeTest: function(test){
		try{
			sh.execute("ps -ef | grep node | grep -v grep",function(err,msg){
				console.log(msg);
				test.ok(true);
				// test.equals("hi\n",msg);
				test.done();
			});
		}catch(err){
			console.log(err);
			test.done();
		}
		
	}


}