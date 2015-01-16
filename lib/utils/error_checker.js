
/**
 * Utility class to catch hystrix error
 *
 */

module.exports=(function(){

    //do something
    function checkStreamData(json){
        var type = json.type;
        switch(type){
            case "HystrixThreadPool":
                return _checkThreadPool(json);
            case "HystrixCommand":
                return _checkCommand(json);
            default:
                console.log("invalid stream type");
                return null;
        }
    }

    function _checkThreadPool(json){
        return null;
    }

    var THRESHOLD = 300;
    function _checkCommand(json){
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

        return errorFields.length > 0 ? errorFields : null;
    }

    return{
        check : checkStreamData
    };

}).call(this);
