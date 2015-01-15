#!/usr/bin/env node
/**
 * Command line start script
 *
 */
(function(){

  // imports
  var program = require('commander');
  var fs = require("fs");
  var path = require("path");
  var fh = require(__dirname+"/utils/file_utils.js");
  var sh = require(__dirname+"/utils/shell_utils.js");

  //Command declaration
  program
    .version('0.0.1')
    .option('-c, --conf_path [cofig_path]', 'path to config.js',process.cwd()+"/config.js");

  program
    .command("config")
    .description("print out sample config ")
    .action(function(){
        console.log(__dirname+"/conf/config.js");
        sh.execute("cat "+__dirname+"/../conf/config.js",function(err,msg){
            if(err) console.log(err);
            else console.log(msg);
        });
   });

  program
    .command("clean")
    .description("clean up old logs ")
    .action(function(){
      clean();
    });


  program
    .command("status")
    .description("Display current status")
    .action(function(){
      showStatus();
   });

  program
    .command("start")
    .description("start watchdog")
    .action(function(){
        if(!program.conf_path && !fs.existsSync(program.conf_path)) {
            console.log("no config.js specified");
            console.log("specify  watchdog start -c <config.js path>");
            return;
        }
        start();
    });

  program
    .command("stop")
    .description("stop watchdog")
    .action(function(){
        stop();
    });

  program
    .command("*")
    .description("Invalid usage")
    .action(welcomeMsg);

  function showStatus(){
    if(!fs.existsSync(program.conf_path)){
      errorMsg();
      process.exit(1);
    }
    var command = "ps -o pid,cmd,args | grep node  | grep -v grep ";
    var pids = fh.getPids(require(program.conf_path).pid);
    for(var i=0; i<pids.length; i++){
      sh.execute(command+" | grep "+pids[i], function(err,msg){
        if(err) console.log(err);
        else {
          var files = msg.trim().split(" ");
          // console.log(files);
          var buff = files[2].split("/");
          var name = buff[buff.length-1]
          console.log(files[0]+" - "+name);
        }
      });
    }
  }

  function clean(){
      if(!fs.existsSync(program.conf_path)){
          errorMsg();
          process.exit(1);
      }
      var loggerConf = require(program.conf_path).logger;
      sh.execute("rm -f "+loggerConf.path+"/*",function(err,msg){
        if(err) console.log("unable to clean logs");
        else console.log("deleted old logs");
      });
  }


  function start(){
    var conf = program.conf_path;
    if (!fs.existsSync(conf)){
      errorMsg();
      process.exit(1);
    }
    var pidFile = require(conf).pid;
    if (fs.existsSync(pidFile)){
      console.log("Oops.. process pid file exist.. ");
      sh.execute("cat "+pidFile);
      process.exit(1);
    }else{
      var bg = require("child_process").fork(__dirname+"/bootstrap.js",
        [program.conf_path],"/usr/bin/env node");// run server as separate process
      // fh.upsertPid(bg.pid,pidFile);
      process.exit(0);
    }
  }

  function stop(){
      var conf = program.conf_path;
      if (!fs.existsSync(conf)){
        errorMsg();
        process.exit(1);
      }
      var pidFile = require(conf).pid;
      var pids = fh.getPids(pidFile);
      if (pids.length === 0){
        console.log("watchdog is not running");
        process.exit(1);
      }


        sh.execute("kill -9 "+pids.join(" "),function(err,msg){
          if(err){
            console.log("unable to stop process");
            process.exit(1);
          } 
          else{
            fs.unlink(pidFile,function(err,msg){
              if(err){
                console.log("unable to remove pid file.. plz remove it manually");
              }
            });
            console.log("watchdog has stopped");
          }
        });
    }


  function welcomeMsg(){
    console.log("Invalid Usage");
    console.log("");
    console.log("use watchdog --help to find out correct options");
    console.log("");
    console.log("to start use watchdog start -c <config path>");
    console.log("");
  }

  function errorMsg(){
    console.log("Oops.. valid config not found in default path "+program.conf_path);
    console.log("");
    console.log("Use watchdog start -c <config.path>  to specify customized path");
    console.log("");
  }

  var args = process.argv;
  if ( args.length === 2){
      args.push("__");
  }

  program.parse(process.argv);


}).call(this);
