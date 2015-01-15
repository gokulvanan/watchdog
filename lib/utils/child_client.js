#!/usr/bin/env node

/**
 * Parent class  with  methods to help in communication to client
 *
 */

module.exports = function(obj){

    var name = obj.name; // name of the child process
    var path = obj.path; // path to js of the child
    var logger = obj.logger; // path to js of the child
    var cp = require('child_process');
    var childProcess = null;
    var running = false;

    function startChild(conf,args){
        if (running) {
            logger.info(name+" is already running");
            return;
        }
        childProcess = cp.fork(path,args);

        _registerListeners();

        childProcess.send( { action: "init", config: conf });

        setTimeout(function(){
            if(!running){
                logger.error("not running "+name);
    //            throw Error("error in starting "+name)
            }
        },500); // wait for 1/2 a sec to get the ack
    }

    function stopChild(conf){
        if(!running) {
            logger.warn(name+" is not running");
            return;
        }
        childProcess.send({ action: "die", config: conf }); // sent for the child to clean up

        setTimeout(function(){
            if(running){
                childProcess.kill('SIGHUP');
            }
        },2000); // wait for 2 seconds for it ack and kill it

    }

    function checkIsRunning(){
        return running;
    }

    function pushDataToChild(data){
        childProcess.send(data);
    }

    function _registerListeners(){

        childProcess.on('exit',function(code,signal){
            logger.info("exiting "+name);
            running = false;
            if(obj.onExit){
                obj.onExit(code,signal);
            }
        });

        childProcess.on('error',function(err){
            //TODO add code to check if we can recover from the error
            logger.error("error in communicating with  turbine");
            logger.error(err);
            running = false;
            if(obj.onError){
                obj.onError(err);
            }
            childProcesss.kill('SIGHUP');
        });

        childProcess.on('message',function(data){
            if( data.action === "init"){
                running = (data.status === 'success');
            }
            else if( data.action === "die"){
                running = (data.status === 'success');
            }
            else{
                if(obj.onReply){
                    obj.onReply(data);
                }
            }
        });
    }


    return {
        start: startChild,
        stop: stopChild,
        isRunning: checkIsRunning,
        send: pushDataToChild

    };

};
