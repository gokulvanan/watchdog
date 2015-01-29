
var watchdog = require(__dirname+"/../watchdog");

watchdog.plugin((function(){


	return{
		// logger:"logger",
		onLoad:function(){
			console.log("turbine.js has loaded");
		},
		onInit:function(data){
			console.log("turbine.js has got init call");
		},
		onDie:function(data){
			console.log("turbine.js has been asked to die");
		},
		onKill:function(data){
			console.log("turbine.js is killed");
		},
		onMessage: function(data){
			console.log(data);
			return data;
		}
	};

}).call(this));