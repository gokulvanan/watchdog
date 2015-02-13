#!/usr/bin/env node


var iris = require("node-iris");
var Eventsource = require('eventsource');
var http = require("http");
var url = require("url");
var logBuilder  = require(__dirname+'/utils/logbuilder');
var func = require(__dirname+'/utils/func');

module.exports = function(){

    function formatCount(boxCount){
        var c  = boxCount+"";
        var buff = boxCount+"";
        for(var i=c.length; i<4; i++){
            buff = "0"+buff;
        }
        return buff;
    }


    var concat = Array.prototype.concat;
    var logger = logBuilder.getLogger(null,"watchdog");
    var server = null, plugins = {}, es = {};


    function createAndBindEventSourceToPlugins(val,key,clusterName){
        var es = new Eventsource(val);
        es.onmessage = function(e){
            var json = JSON.parse(e.data);
            for(var p in plugins){
                var pluginObj = plugins[p];
                if(pluginObj.isRunning()){
                    var obj = { 
                        cluster : clusterName,
                        host    : key,
                        data    : json 
                    };     
                    logger.debug(obj);
                    pluginObj.tell(obj);
                }
            }
        }
        es.onerror = function(e){
            logger.error("error in stream from cluster:"+clusterName+" , key: "+key);
        }
        return es;
    }

    function constructEventSourceClients(val,key){
        return func.map(val,function(v,k){
            return createAndBindEventSourceToPlugins(v,k,key);
        });
    }


    function transformClusters(val,key){
        var output = {};
        for(var j=0; j<val.length; j++){
            var obj = val[j];
            for(var i = obj.start; i <= obj.stop; i++){
                var count = (obj.format_count) ? formatCount(i) : i;
                output[obj.prefix+i] = "http://"+obj.prefix+count+"."+obj.suffix+obj.path;
            }
        }
        return output;
    }

    function instantiateChild(val,key,config,clusters){
        var path = (val.path) ? val.path : __dirname+"/plugins/"+key+".js";
        var pluginConf = val;
        if(!pluginConf.logger) pluginConf.logger = config.logger; // use base logger settings if not configured
        if(!pluginConf.clusters) pluginConf.clusters = clusters; 
        var child =  iris.child({
            name : key,
            path : path,
            onMessage : function(data){
                logger.debug(key+" data: "+JSON.stringify(data));            
            },
            onError : function(err){
                logger.debug(key+" error: "+err.stack);
            },
            onExit : function (code,signal){
                logger.debug(key+" exit : "+signal);
            }
        });

        child.start({ config: pluginConf });
        return child;
    }

    // supports
    // /listeners/stop?cluster=name&host=name1,name2
    // /plugins/enable?name=name1,name2
    // /plugins/disable?name=1,name
    function buildHttpServer(conf,es,plugins){
        server = http.createServer(function (request, response) {
            response.writeHead(200, {'Content-Type':"application/json" });
            try{
                var reqObj = url.parse(request.url,true);
                var path = reqObj.pathname.substring(1);
                if(path.indexOf('listeners')){
                    var action = path.split("/")[1];
                    if(action === 'stop' || action === 'stop'){
                        var query = reqObj.query;
                        throw ({ status :'success', msg:"under construction"});
                    }else{
                        throw ({ status: "failure" , msg:"invalid listeners action" });
                    }
                }else if(path.indexOf('plugins')){
                    var action = path.split("/")[1];
                    if(action === 'enable'|| action === 'disable'){
                        throw ({ status :'success', msg:"under construction"});
                    }else{
                        throw ({ status: "failure" , msg:"invalid plugins action" });
                    }
                }else{
                   throw ({ status: "failure" , msg:"invalid path" });
                }
            }catch(err){
                response.end(JSON.stringify(err));
            }
        }).listen(conf.port, '127.0.0.1');
        logger.debug('Server running at http://127.0.0.1:'+conf.port+'/');
    }


    function cleanupEventStreams(val,key){
       return func.map(val,function(v,k){
            v.close();
            return null;
        });
      
    }

    function cleanupChildProcess(val,key){
        logger.debug(key);
        val.stop(); //stop child process
        return val;
    }

  


    return {

        start: function(conf){
            this.logger = logBuilder.getLogger(conf.logger,'watchdog');
            logger.debug(conf);
            var clusters = func.map(conf.clusters,transformClusters);
            logger.debug(clusters);
            plugins = func.map(conf.plugins,function(val,key){
                return instantiateChild(val,key,conf,clusters);
            });
            logger.debug(plugins);
            es  = func.map(clusters,constructEventSourceClients);
            logger.debug(this.es);

            buildHttpServer(conf);
        },

        stop: function(cb){
            cb = (cb) ? cb : function(e,msg){
                logger.info("server has stopped");
            }
            es = func.map(this.es, cleanupEventStreams);
            plugins = func.map(plugins, cleanupChildProcess);
            if(this.server){   
                server.close(cb);
            }else{
                cb();
            }
        },

        plugin : function(obj){
            iris.extend(obj);
        } 

    }
    
}();

