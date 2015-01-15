


module.exports=(function(){

    var events = require('events');
    var ee = new events.EventEmitter();


    /**
        {
            cluster:{
                HystrixCommand:{
                    cartHttpReq:{
                
                    }
                }
            }
        }
    */
	var data = {};

    

    function aggregate(obj){
       // console.log(obj);
       var cluster =  obj.cluster;
       var type = obj.data.type;
       var poolName = obj.data.name;
     
       var clusterObj =  data[obj.cluster];

       if(!clusterObj){
            clusterObj = { type: { poolName: obj.data } };
            data[obj.cluster] = clusterObj;
            return;
       }
       var typeObj = clusterObj[type];
       if(!typeObj){
            typeObj = { poolName : obj.data };
            clusterObj[type] = typeObj;
            return;
       }

       var poolObj = typeObj[poolName];
       if(!poolObj){
            poolObj = obj.data;
            typeObj[poolName] = poolObj;
            return;
       }
        
       if(type === "HystrixCommand"){
         poolObj = _aggregateCommand(obj.data,poolObj);
       }
       else if (type === "HystrixThreadPool"){
          poolObj = _aggregateThreadPool(obj.data,poolObj);
       }

    }


    function flush(){
        // console.log("emmit call");
       for(var c in data){
            // console.log(c);
            var obj = data[c];
            for(type in obj){
                for(pool in obj[type]){
                    ee.emit("flush",{ cluster:c, data:JSON.stringify(obj[type][pool]) });
                   // ee.emit(c, JSON.stringify(obj[type][pool]));
                }
            }
       }
       data = {}; //reset
    }

     function _aggregateCommand(newVal, oldVal){
        oldVal.currentTime = (oldVal.currentTime < newVal.currentTime) ? newVal.currentTime : oldVal.currentTime;
        oldVal.isCircuitBreakerOpen = (newVal.isCircuitBreakerOpen) ? newVal.isCircuitBreakerOpen : oldVal.isCircuitBreakerOpen;
        oldVal.errorPercentage += newVal.errorPercentage;
        oldVal.errorCount += newVal.errorCount;
        oldVal.requestCount += newVal.requestCount;
        oldVal.rollingCountCollapsedRequests +=  newVal.rollingCountCollapsedRequests ;
        oldVal.rollingCountExceptionsThrown +=   newVal.rollingCountExceptionsThrown ;
        oldVal.rollingCountFailure +=    newVal.rollingCountFailure  ;
        oldVal.rollingCountFallbackFailure +=    newVal.rollingCountFallbackFailure  ;
        oldVal.rollingCountFallbackRejection +=  newVal.rollingCountFallbackRejection ;
        oldVal.rollingCountFallbackSuccess +=    newVal.rollingCountFallbackSuccess  ;
        oldVal.rollingCountResponsesFromCache +=     newVal.rollingCountResponsesFromCache;
        oldVal.rollingCountSemaphoreRejected +=  newVal.rollingCountSemaphoreRejected ;
        oldVal.rollingCountShortCircuited +=     newVal.rollingCountShortCircuited;
        oldVal.rollingCountSuccess +=    newVal.rollingCountSuccess  ;
        oldVal.rollingCountThreadPoolRejected +=     newVal.rollingCountThreadPoolRejected;
        oldVal.rollingCountTimeout +=    newVal.rollingCountTimeout  ;
        oldVal.currentConcurrentExecutionCount +=    newVal.currentConcurrentExecutionCount  ;
        oldVal.latencyExecute_mean = (newVal.latencyExecute_mean+oldVal.latencyExecute_mean)/2;
        //update latencyExecute
        oldVal.latencyTotal_mean = (newVal.latencyTotal_mean+oldVal.latencyTotal_mean)/2;
        //update latency_total
        oldVal.reportingHosts += newVal.reportingHosts;
        return oldVal;
    }

    function _aggregateThreadPool(newVal, oldVal){
        oldVal.currentTime+=newVal.currentTime;
        oldVal.currentActiveCount+=newVal.currentActiveCount;
        oldVal.currentCompletedTaskCount+=newVal.currentCompletedTaskCount;
        oldVal.currentCorePoolSize+=newVal.currentCorePoolSize;
        oldVal.currentLargestPoolSize+=newVal.currentLargestPoolSize;
        oldVal.currentMaximumPoolSize+=newVal.currentMaximumPoolSize;
        oldVal.currentPoolSize+=newVal.currentPoolSize;
        oldVal.currentQueueSize+=newVal.currentQueueSize;
        oldVal.currentTaskCount+=newVal.currentTaskCount;
        oldVal.rollingCountThreadsExecuted+=newVal.rollingCountThreadsExecuted;
        oldVal.rollingMaxActiveThreads+=newVal.rollingMaxActiveThreads;
        oldVal.reportingHosts+=newVal.reportingHosts;
    }
        
    setInterval(flush,1000); 
    

    return{
        aggregate: aggregate,
        onFlush: function(cb){
            ee.on("flush",cb);
        }
     
    };

}).call(this);