
var watchdog = require(__dirname+"/../watchdog");
var nodemailer = require('nodemailer');
var logBuilder  = require(__dirname+'/../utils/logbuilder');

watchdog.plugin((function(){

    var logger = logBuilder.getLogger(null,'alert');
    var transporter = null;
    var conf = null;

 	var store = require(__dirname+'/../utils/store');
	var errorchecker = require(__dirname+'/../utils/errorchecker');
    

    function sendmail(errorObjs){
    	var errorConf = conf.email.error;
    	for(var command in errorObjs){
    		var emailObj = {
	            from: errorConf.from,
	            to: errorConf.to,
	            subject: 'Hystrix Error for command '+command,
	            text: JSON.stringify(errorObjs[command], undefined, 2) // pretty print JSON
	        };
	        if(errorConf.cc){
	            emailObj.cc = errorConf.cc;
	        }
	        transporter.sendMail(emailObj, function(err,data){
	            if(err){
	                logger.error("Error in sending email");
	                logger.error(err.stack);
	            } 
	        });
    	} 
    }

    function flush(){
    	var errorObjs = store.drain();
    	logger.info(errorObjs);
		// sendmail(errorObjs);
    }

	return{
		// logger:"logger",
		onLoad:function(){
			logger.info("alert.js has loaded");
		},
		onInit:function(data){
			logger.info("alert.js has got init call");
			var conf = data.config;
			logger = logBuilder.getLogger(conf.logger,'alert');
			store.setLogger(logger);
			errorchecker.setLogger(logger);
			nodemailer.createTransport(conf.email.transport);
			setInterval(flush,conf.flushInterval);
		},
		onDie:function(data){
			logger.info("alert.js has been asked to die");
			flush();
		},
		onKill:function(data){
			logger.info("alert.js is killed");
		},
		onMessage: function(data){
			logger.debug(data)
			var error = errorchecker.check(data.data);
			if(error){
				data.error = error;
				store.update(data);
			}
			return "ack";
		}
	};

}).call(this));