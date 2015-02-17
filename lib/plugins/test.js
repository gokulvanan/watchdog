
var watchdog = require(__dirname+"/../watchdog");

watchdog.plugin((function(){

    

	return{
		// logger:"logger",
		onLoad:function(){
			console.log("test.js has loaded");
		},
		onInit:function(data){
			console.log("test.js has got init call");
			
		},
		onDie:function(data){
			console.log("test.js has been asked to die");

		},
		onKill:function(data){
			console.log("test.js is killed");
		},
		onMessage: function(data){
			// console.log(data);
			//do nothing
			return "ack";
		}
	};

}).call(this));