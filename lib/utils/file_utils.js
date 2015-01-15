
/**
 * Utilty class to perform file manipulation
 *
 */

module.exports=(function(){

    var fs = require("fs");

    //TODO(gokul) avoid rewrite and figure out how to append to file
    function upsertPid(pid,filePath){
        var prevIds = "";
       if(fs.existsSync(filePath)){
        prevIds += fs.readFileSync(filePath);
        prevIds += ",";
       }
       prevIds += pid;
       fs.writeFileSync(filePath,prevIds);
    }

    /**
    *  returns array of pids
    */
    function getPids(filePath,cb){
        if(!fs.existsSync(filePath)){
            if(cb){
                cb(null,[]);
            }else{
                return [];
            }
        }
        else{
            if(cb){
                fs.readFile(filePath,function(err,data){
                    if(err) cb(err);
                    else cb(null,data.toString().split(","));
                });
            }
        }
        return fs.readFileSync(filePath).toString().split(",");
    }

   

    return{
        upsertPid : upsertPid,
        getPids: getPids
    };

}).call(this);
