#!/usr/bin/env node

/*
 * class listens to error events and builds error report
 */


var makeChild = require('../utils/child.js');

makeChild((function(){

    var nodemailer = require('nodemailer');
    var transporter = null;
    var errorEmailConf = null;
  

    var logger = null;
    var data = {};

    function init(log,config){
        logger = log
        var emailConf = config.email;
        errorEmailConf = emailConf.error;
        transporter = nodemailer.createTransport(emailConf.transport);
        setInterval(flush,config.alert.flushInterval); 
    }

    /**
     *
     */
    function processAlert(data){
        var resp = { status:"success", msg:null };
        if (data.action === 'message'){
            update(data);
        }else {
            resp.status = 'failure';
            resp.msg = "Invalid action msg (should be start/stop) ";
            logger.error("invalid request");
            logger.error(data);
        }

        return resp;
    }


    function update(obj){
       // console.log(obj);
       var poolName = obj.data.name;
       if(!data[poolName]){
        data[poolName] = [];
       }
       data[poolName].push(obj);
    }


    function flush(){
      for(var poolName in data){
        var errorObj = buildErrorObj(data[poolName]); // build error obj
        if(!isNoise(errorObj,poolName)) {
            emailAlert(errorObj,poolName);
        }
      }
      data = {}; //reset
    }

    function buildErrorObj(objs){
        var errors = [];
        for(var i=0; i<objs.length; i++){
            var errorObj= {};
            var obj = objs[i];
            errorObj.poolName=obj.data.name;
            errorObj.host=obj.host;
            errorObj.timestamp= new Date(obj.data.currentTime);
            errorObj.hystrixFields = getHystrixFields(obj.error,obj.data);
            errorObj.log=getLog(obj.host,obj.data.currentTime);
            errors.push(errorObj);
        return errors;
        }
       
    }

    function getHystrixFields(errorFlds,data){
        var obj = {};
        for (var i=0; i<errorFlds.length; i++){
            obj[errorFlds[i]] = data[errorFlds[i]];
        }
        return obj;
    }

    function getLog(host,timestamp){
        return "Unable to fetch logs right now, please check yourself from "+host;
    }

    function isNoise(obj,poolName){
        if(poolName === "fulfillmentServiceHttpRequest"){
            return true;
        }
        // TODO analyze obj.log payload
        return false;
    }
     
        
   

    function emailAlert(obj,poolName){
        var emailObj = {
            from: errorEmailConf.from,
            to: errorEmailConf.to,
            subject: 'Hystrix Error for pool '+poolName,
            text: JSON.stringify(obj, undefined, 2)
        };
        if(errorEmailConf.cc){
            emailObj.cc = errorEmailConf.cc;
        }
        transporter.sendMail(emailObj, function(err,data){
            if(err){
                logger.error("Error in sending email");
                logger.error(err.stack);
            } 
        });
    }

   
    return{
        name:"alert",
        onMessage: processAlert,
        onLoad:init
    };
}).call(this));
