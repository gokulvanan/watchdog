
var func = require(__dirname+'/../utils/func');

module.exports = function(){

	var logger  = {
		info:console.log,
		debug:console.log,
		error:console.log
	}

	var data = {};

	function update(obj){
       var command = obj.data.name;
       if(!data[command]){
        data[command] = [];
       }
       // getContext(obj.host,obj.data.ids, function(err,ctx){
       // 		if(err){
       // 			logger.error(err.stack);
       // 		}else{
       // 			obj.context = ctx;
       // 		}
       // 		data[command].push(obj);
       // });
		data[command].push(obj);
    }


    function drain(){
    	var errorObjs = func.map(data,function(val,key){
    		return func.map(val,transformToErrorObj);
    	});
    	// console.log(errorObjs);
        errorObjs = func.map(errorObjs,function(val,key){
        	return func.filter(val,isNotNoise);
        });

        data = {}; //reset
        return errorObjs;
    }


    function transformToErrorObj(obj){
        var errorObj= {};
        errorObj.group = obj.data.group;
        errorObj.command=obj.data.name;
        errorObj.host=obj.host;
        errorObj.timestamp= obj.data.currentTime;
        errorObj.hystrixFields = getHystrixFields(obj.error,obj.data);
        // errorObj.context=obj.context;
    	return errorObj;
    }

    function getHystrixFields(errorFlds,data){
        var obj = {};
        for (var i=0; i<errorFlds.length; i++){
            obj[errorFlds[i]] = data[errorFlds[i]];
        }
        return obj;
    }

    function isNotNoise(obj){
    	if(obj.command === '"fulfillmentServiceHttpRequest"'){
    		return false;
    	}
    	//TODO add more logic here
    	return true;
    }

    return{
    	update:update,
    	drain: drain,
    	setLogger: function(logger){
    		this.logger = logger;
    	}
    };

}();