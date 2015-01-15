
/**
 * Utility class used in logging
 *
 */

module.exports=(function(){
    var fs = require('fs');
    var path = require("path");
    var winston = require('winston');



    function _getConfig(conf,type){
      var logConf = conf.logger;
      if(!logConf) return null;
      // console.log(conf.logger);
      // console.log( fs.existsSync(logConf.path));
      if(logConf.path && fs.existsSync(logConf.path)){
        var config={};
        config.file = path.resolve(logConf.path)+"/"+type+"_"+process.pid+".log";
        config.level=(logConf.level)? logConf.level : "info";
        config.consoleDisabled = logConf.consoleDisabled;
        return config;
      }else{
        throw new Error("Logger not properly configured.. log path '"+logConf.path+"'mentioned in config.json is not valid.")
      }
    };

    // create logger based on config.js and provide options to switch dir and log file name based on its intended use
    // such as server.log and cron.log in separte directories
     function getLogger(conf,type){
      if(!conf) return _emptyLogger();
      var config = _getConfig(conf,type);
      if(config === null) {
        return _emptyLogger();
      };// empty implementation fo logger to ensure that the code doest crash
      var consoleDisable = config.consoleDisabled; // disable console log in start mode
      var appenders =  [ //TODO add more configuration to transport to customize
        new (winston.transports.File)({ timestamp:true, colorize:true,  json:true, level: config.level, filename: config.file, silent: (!consoleDisable) }),// disable file when console log is enabled and viceversa
        new (winston.transports.Console)({ timestamp:true, colorize:true,  json:true, level: config.level, silent:consoleDisable }) 
      ];
      var logger = new (winston.Logger)({	   transports: appenders    });
      var levels= {emerg: 7,critical: 6, "alert": 5, error: 4,warn: 3,info: 2,debug: 1, trace: 0  };
      logger.cli(); //better formatted output
      logger.setLevels(levels);
      return logger;
    }

    function _emptyLogger(){
      // console.log("warning: No Logger configured");
      return {
        trace: function(msg,data){},
        debug: function(msg,data){},
        info: function(msg,data){},
        warn: function(msg,data){},
        error: function(msg,data){},
        alert: function(msg,data){},
        critical: function(msg,data){},
        emerg: function(msg,data){}
      };
    }

    return {
        getLogger: getLogger,
        
    };

}).call(this);
