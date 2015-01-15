
/**
 * Utilty class to perform shell commands
 *
 */

module.exports=(function(){

    var cp = require("child_process");

    function spawn(obj,cb){
        var spawn = cp.spawn;
        var command = (obj.args) ? spawn(obj.cmd,[obj.args]) 
          : spawn(obj.cmd);
        var result = '';
        command.stdout.on('data', function(data) {
             result += data.toString();
        });
        command.on('close', function(code) {
            return cb(null,result);
        });
        command.on('error', function(err,msg) {
            return cb(err);
        });
    }

    function execute(cmd,cb){
        var exec = cp.exec;
        exec(cmd,function(err,stdout,sterr){
            if(err) cb(err);
            else cb(null,stdout+"");
        });
    }
    
    return{
        spawn : spawn,
        execute: execute
    };

}).call(this);
