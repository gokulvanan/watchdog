
module.exports = function(){

	var logger  = {
		info:console.log,
		debug:console.log,
		error:console.log
	}

	function checkStreamData(json){
        var type = json.type;
        switch(type){
            case "HystrixThreadPool":
                return checkThreadPool(json);
            case "HystrixCommand":
                return checkCommand(json);
            default:
                logger.debug("invalid stream type");
                return null;
        }
    }

    function checkThreadPool(json){
        return null;
    }

    var THRESHOLD = 300;
    function checkCommand(json){
        var errorFields = []
        with(json){
            if(isCircuitBreakerOpen) errorFields.push( "isCircuitBreakerOpen");
            if(errorPercentage > 0) errorFields.push( "errorPercentage");
            if(errorCount > 0) errorFields.push( "errorCount");
            if(rollingCountCollapsedRequests > 0) errorFields.push( "rollingCountCollapsedRequests");
            if(rollingCountExceptionsThrown > 0) errorFields.push( "rollingCountExceptionsThrown");
            if(rollingCountFailure > 0) errorFields.push( "rollingCountFailure");
            if(rollingCountFallbackFailure > 0) errorFields.push( "rollingCountFallbackFailure");
            if(rollingCountFallbackRejection > 0) errorFields.push( "rollingCountFallbackRejection");
            if(rollingCountSemaphoreRejected > 0) errorFields.push( "rollingCountSemaphoreRejected");
            if(rollingCountThreadPoolRejected > 0) errorFields.push( "rollingCountThreadPoolRejected");
            // if(latencyTotal['99.5'] > propertyValue_executionIsolationThreadTimeoutInMilliseconds - THRESHOLD) errorFields.push( "latencyTotal");
        }
        // console.log(errorFields);
        return errorFields.length > 0 ? errorFields : null;
    }
    return {
    	check: checkStreamData,
    	setLogger: function(logger){
    		this.logger = logger;
    	}
    }
}();