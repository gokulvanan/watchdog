#!/usr/bin/env node

/*
 * listener to hystrix streams from configured clusters
 *
 */


var makeChild = require('../utils/child.js');
makeChild((function(){


    var Eventsource = require('eventsource');
    var makeChildClient = require("../utils/child_client.js"); // utilty to help communication with child fork process
    var errorChecker = require("../utils/error_checker.js"); // utilty to help checking error in hystrix streams
    var turbine = null, alert = null, logger = null;

    //Called when process starts and js is loaded
    function setup(log){
        logger = log;
        turbine = makeChildClient({
            name:"turbine",
            path:__dirname+"/turbine.js",
            onMessage:null,
            onError:null,
            onExit:null,
            logger:log
        });

        alert = makeChildClient({
            name:"alert",
            path:__dirname+"/alert.js",
            onMessage:null,
            onError:null,
            onExit:null,
            logger:log
        });

    }
   
    var CLUSTER_CONNECTIONS = {}; // used to hold cluster instance

    process.on("SIGINT", function(){
        if(alert.isRunning()) alert.stop();
        if(turbine.isRunning()) turbine.stop();
        setTimeout(function(){
        },1000);
    });

    /**
     * starts and stops based on incoming data
     * data ={ action='start/stop' , config:{ clusterName: [hosts list] }
     *
     */
    function processMessage(data){
        var resp = { status:"success", msg:null };
        if( data.action === 'start'){
            if(data.entity === 'all' || data.entity === 'turbine')
                turbine.start(data,[process.argv[2]]);
            if(data.entity === 'all' || data.entity === 'alert')
                alert.start(data,[process.argv[2]]);
            if(data.entity === 'all' || data.entity === 'listeners')
                start(data);
            resp.msg = "Successfully started";
        }else if (data.action === 'stop'){
            if(data.entity === 'all' || data.entity === 'turbine')
                turbine.stop(data);
            if(data.entity === 'all' || data.entity === 'alert')
                alert.stop(data);
            if(data.entity === 'all' || data.entity === 'listeners')
                stop(data);
            resp.msg = "Successfully stopped";
        }else {
            resp.status = 'failure';
            resp.msg = "Invalid action msg (should be start/stop) ";
        }
        return resp;
    }


    function start(data){
        logger.info("start listener call");
        var clusterFilter = _buildFilter(data.clusters); //build filter obj
        var hostFilter = _buildFilter(data.hosts); //build filter obj
        var clusterConfig = data.config.clusterConfig;
        var inverseMap = data.config.inverseMap;
        logger.info(inverseMap);
        // listen to clusters
        for(var cluster in clusterConfig){
            if (clusterFilter.isEnabled(cluster)){
                var hosts  = clusterConfig[cluster];
                var connMap={};
                for(var i=0; i<hosts.length; i++){
                    var host = hosts[i];
                    if(hostFilter.isEnabled(host.name)){
                        logger.info("starting "+host.name);
                        logger.debug(host.url);
                        var es = new Eventsource(host.url);
                        (function(name){
                            //clousre to ensure correct host name is not lost   
                            //es.reconnectInterval=500;
                            es.onmessage =  function(e){
                                var json = JSON.parse(e.data);
                                // console.log(name);
                                var data = { action:"message", "cluster":inverseMap[name], host:name, "data":json };
                                logger.debug(json);
                                if(turbine.isRunning()){
                                    turbine.send(data); // push data to turbine if enabled
                                }
                                var msg = errorChecker.check(json);

                                //push data to alert if its and error
                                if(alert.isRunning() && msg != null){
                                    data.error = msg;
                                    alert.send(data); // push data to alert.js if enabled
                                }
                            }
                        })(host.name);
                      
                        connMap[host.name]=es;
                    }
                }
                CLUSTER_CONNECTIONS[cluster]=connMap;
            }
        }
    }


    function stop(data){
        var clusterFilter = _buildFilter(data.clusters); //build filter obj
        var hostFilter = _buildFilter(data.hosts); //build filter obj

        for(var cluster in CLUSTER_CONNECTIONS){
            if (clusterFilter.isEnabled(cluster)){
                var hosts = data.clusterConfig[cluster];
                for(var i=0; i<hosts.length; i++){
                    var host = hosts[i];
                    logger.info("stopping "+host.name);
                    if(hostFilter.isEnabled(host.name)){
                        var hostMap = CLUSTER_CONNECTIONS[cluster];
                        if(hostMap[host.name]){
                            var es = hostMap[host.name];
                            try{
                                es.close();
                                hostMap[host.name]=undefined;
                            }catch(err){
                                //TODO  figure out what to do herej
                                logger.error("Error in closing stream connection for host"+host.name);
                                logger.error(err);
                            }
                        }
                    }
                }
            }
        }
    }


    /*
     * builds filter function over list
     * to filter object with proper isEnabled function 
     *
     */
    function _buildFilter(lst){
        var map = null;
        if(lst){
            map = {};
            for (var i=0; i<lst.length; i++){
                map[lst[i]]=true;
            }
        }

        return {
            isEnabled: function(name){
                return (map === null ||  map[name]);
            }
        };
    }


    return{
        name:"listener",
        onMessage: processMessage,
        onLoad: setup
    };

}).call(this));



