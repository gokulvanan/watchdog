
/*
 * Sample config file
 */
module.exports = function(){
return {
    port:8080,
    clusters:{
        callisto_primary:[
            {
                prefix:"co-callisto-svc",
                start:1,
                stop:25,
                suffix:"nm.flipkart.com",
                path:":9993/hystrix.stream"
            }
        ],  
        "metis":[
            {
                "prefix":"co-metis-svc-",
                "start":1,
                "stop":4,
                "format_count":true,
                "suffix":"nm.flipkart.com",
                "path":":9953/admin/hystrix.stream.global"
            },
        ]
    },
    plugins:{
        turbine:{
            server:{
                port:8888,
                path:"/hystrix.cluster.stream"
            },

        },
        alert:{
            email:{
               transport:{
                    service: 'gmail',
                    auth: {
                        user: 'coloadtest@gmail.com',
                        pass: 'load@load'
                    }
                },
                error:{
                    from: 'Hystrix Alert <coloadtest@flipkart.com>',
                    to: 'gokulvanan.v@flipkart.com'
                }
            },
            flushInterval:120000 // flush every 2 min
        }
    },
    logger:{
        path: __dirname+"/../logs",
        consoleDisabled:false,
        level: "info" // change to trace or  debug to check framewrok trace/debug logs
    }
  };
}();


