
/*
 * Sample config file
 */
module.exports = function(){
return {
    clusterConfig:{
        clustername:[
            {
                prefix:"host prefix",
                start:1,
                stop:5,
                suffix:"host suffix",
                path:":path to hystrix.stream.global"
            }
        ]
    },
    turbine:{
    	enabled:false
    },
    alert:{
    	enabled:true,
    	flushInterval:2000,
    },
    logger:{
        path: __dirname+"../logs",
        consoleDisabled:false,
        level: "info" // change to trace or  debug to check framewrok trace/debug logs
    },
    email:{
       transport:{
            service: 'gmail',
            auth: {
                user: 'from email',
                pass: 'pwd'
            }
        },
        error:{
            from: 'from address',
            to: 'to address'
        }
    },
    pid:"/tmp/watchdog.pid"
  };
}();


