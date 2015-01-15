#!/usr/bin/env node


/*
 * class aggregates turbine streams every T seconds.
 * T = configured from config
 *
 */

var makeChild = require('../utils/child.js');
makeChild((function(){

    var logger = null
    var store = require("../utils/store.js");
    var server = null;
    var url = require('url');
    var fs = require('fs');


    store.onFlush(function(data){
       console.log(data);
    });

    function init(log){
        logger = log
        server = require("../utils/server.js")(logger);
        server.start({ 
            contentType:"text/event-stream", 
            port:9222, 
            handle: function(req,resp){
                var q = url.parse(req.url,true);
                var cluster = q.pathname.substring(1).trim();
                logger.info(cluster);
                // io
                // resp.end("test");
                // store.on(""function(data)
                //     resp.write()
                // ));

            }
        });
    }



    function shutdown(){
        server.stop();
    }


    /**
     *
     */
    function processTurbine(data){
        // logger.info("in turbine");
        var resp = { status:"success", msg:null };
        if (data.action === 'message'){
            resp.msg = "gotData";
            // logger.info(data.cluster);
            store.aggregate(data);
        }else {
            resp.status = 'failure';
            resp.msg = "Invalid action msg (should be start/stop) ";
            logger.error("invalid request");
            logger.error(data);
        }
        return resp;
    }

    return{
        name:"turbine",
        onMessage: processTurbine,
        onLoad:init,
        onKill:shutdown
    };
}).call(this));
