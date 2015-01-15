


/**
 * Utility calss to build http server
 *
 */

module.exports=function(logger){

	var http = require("http");
	var server = null;

    function startServer(obj){
        server = http.createServer(function (req, res) {
              res.writeHead(200, {'Content-Type':obj.contentType });
                if(obj.handle){
                    obj.handle(req,res);
                }else{
                    res.end('{ "status": "running" }');
                } 
        }).listen(obj.port, '127.0.0.1');
        logger.info('Server running at http://127.0.0.1:'+obj.port+'/');
    }

    function stopServer(cb){
        server.close(function(){
            logger.info("server has stopped");
            if(cb) cb();
        });
    }

    function isServerRunning(){
    	return server != null;
    }

    return{
        start : startServer,
        stop: stopServer,
        isRunning: isServerRunning
    };

};