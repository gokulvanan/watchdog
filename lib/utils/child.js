#!/usr/bin/env node

/*
 * Parent class with methods needed by child_process
 */

module.exports=function(obj){

    var confPath = process.argv[2];
    var config = require(confPath);
    var logger  = require(__dirname+"/logger.js").getLogger(config,obj.name); 
    var fh = require("./file_utils.js");

    fh.upsertPid(process.pid,config.pid);

    if(obj.onLoad){
        logger.info("loading child: "+obj.name);
        obj.onLoad(logger,config);
    }

    /**
     * Invoked when message is sent form parent process (parent script)
     *
     */
    process.on('message',processEvent);

    process.on("SIGINT", function(){
        if(obj.onKill) obj.onKill();
        logger.info("killed child: "+obj.name)
    });
    /**
     *
     */
    function processEvent(data){
        var resp = { status:"success", msg:null };
        try{
            if(data.action === 'init'){
                if (obj.onInit) obj.onInit(data);
            }else if (data.action === 'die'){
                if(obj.onDie) obj.onDie(data);
            }else {
                resp = obj.onMessage(data);
            }
            resp.action = data.action;
        }catch(err){
            if(obj.onError) obj.onError(err);
            throw err;
            resp.action = data.action;
            resp.status = "error";
            resp.msg=err.stack;
        }
        process.send(resp);
    }

};
