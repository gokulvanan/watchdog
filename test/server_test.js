
var watchdog = require(__dirname+"/../lib/watchdog.js");

module.exports = {
	
	watchdogServer: function(test){
		var conf = require(__dirname+"/mockconfig.js")
		watchdog.start(conf);
		setTimeout(function(){
			console.log("stop");
			watchdog.stop();
			test.done();
		},5000);
	},

	newTest: function(test){
		test.done();
	},

	// eventsourceTest: function(test){
	// 	var EventSource  = require('eventsource');
	// 	var es  = new EventSource('http://co-metis-svc-0001.nm.flipkart.com:9953/admin/hystrix.stream.global');
	// 	es.onmessage = function(e){
	// 		console.log(e.data);
	// 	};

	// 	es.onerror = function(e){
	// 		console.log('error');
	// 	};

	// 	setTimeout(function(){
	// 		es.close();
	// 		test.done();
	// 	},5000);

	// }

}