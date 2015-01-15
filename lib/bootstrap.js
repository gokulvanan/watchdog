#!/usr/bin/env node

(function(){

    var confPath = process.argv[2];
    var config = require(confPath);
    var fh = require(__dirname+"/utils/file_utils.js");
    var sh = require(__dirname+"/utils/shell_utils.js");
    var makeChildClient = require(__dirname+"/utils/child_client.js"); // utilty to help communication with child fork process
    var logger  = require(__dirname+"/utils/logger.js").getLogger(config,"watchdog");
    var server = require(__dirname+"/utils/server.js")(logger);

    var listener = makeChildClient({
        name:"listener",
        path:__dirname+"/framework/listener.js",
        onMessage:null,
        onError:null,
        onExit:null,
        logger:logger
    });

    fh.upsertPid(process.pid,config.pid);
    listener.start(config,[confPath]);

    var clusterInfo  = _processConfig(config.clusterConfig);
    config.clusterConfig = clusterInfo.clusterConfig;
    config.inverseMap = clusterInfo.inverseMap;
    config.consoleDisable=true;


    listener.send({ action:"start", entity:"listeners", "config":config });

    if(config.turbine && config.turbine.enabled){
        listener.send({ action:"start", entity:"turbine", "config":config });
    }

    if(config.alert && config.alert.enabled){
        listener.send({ action:"start", entity:"alert", "config":config });
    }


   server.start({ contentType:"application/json", port:9444 });


    process.on("SIGINT", function(){
        server.stop();
    });

    function _processConfig(config){
        var clusterConfig = {};
        var inverseMap = {};
        for(var cluster in config){
            var groups = config[cluster];
            var hosts = [];
            for(var i=0; i<groups.length; i++){
                hosts = hosts.concat(_buildHost(groups[i],inverseMap,cluster));
            }
            clusterConfig[cluster] = hosts;
        }
        return { "clusterConfig":clusterConfig , "inverseMap":inverseMap };
    }

    function _buildHost(hostGroup,inverseMap,cluster){
        var hosts = [];
        for(var i= hostGroup.start; i<=hostGroup.stop; i++){
            var box = (hostGroup.format_count) ? _formatCount(i) : i;
            var url = "http://"+hostGroup.prefix+box+"."+hostGroup.suffix+hostGroup.path;
            var name = hostGroup.prefix+box
            hosts.push( { "name": name, "url":url });
            inverseMap[name] = cluster;
        }
        return hosts;
    }


    function _formatCount(boxCount){
        var c  = boxCount+"";
        var buff = boxCount+"";
        for(var i=c.length; i<4; i++){
            buff = "0"+buff;
        }
        return buff;
    }

    


}).call(this);

