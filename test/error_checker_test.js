


var mock_no_error_data = {"cluster":"callisto_primary","host":"co-callisto-svc5","data":{"type":"HystrixCommand","name":"UPDATE_CART","group":"cartGroup","currentTime":1422547476737,"ids":["11536317990252642","11536317894949480","11536318951477114","11536318164088176","11536318234611342","11536320860984164","11536321107859592","11536322621158389","11536322686785785","11536322960897135","11536323998061871","11536324616255487","11536324671242176","11536325107543390","11536325177063054"],"isCircuitBreakerOpen":false,"errorPercentage":0,"errorCount":0,"requestCount":15,"rollingCountCollapsedRequests":0,"rollingCountExceptionsThrown":0,"rollingCountFailure":0,"rollingCountFallbackFailure":0,"rollingCountFallbackRejection":0,"rollingCountFallbackSuccess":0,"rollingCountResponsesFromCache":0,"rollingCountSemaphoreRejected":0,"rollingCountShortCircuited":0,"rollingCountSuccess":15,"rollingCountThreadPoolRejected":0,"rollingCountTimeout":0,"currentConcurrentExecutionCount":0,"latencyExecute_mean":81,"latencyExecute":{"0":40,"25":53,"50":78,"75":99,"90":115,"95":136,"99":301,"100":301,"99.5":301},"latencyTotal_mean":81,"latencyTotal":{"0":40,"25":53,"50":78,"75":99,"90":115,"95":136,"99":301,"100":301,"99.5":301},"propertyValue_circuitBreakerRequestVolumeThreshold":20,"propertyValue_circuitBreakerSleepWindowInMilliseconds":5000,"propertyValue_circuitBreakerErrorThresholdPercentage":50,"propertyValue_circuitBreakerForceOpen":false,"propertyValue_circuitBreakerForceClosed":false,"propertyValue_circuitBreakerEnabled":true,"propertyValue_executionIsolationStrategy":"THREAD","propertyValue_executionIsolationThreadTimeoutInMilliseconds":3000,"propertyValue_executionIsolationThreadInterruptOnTimeout":true,"propertyValue_executionIsolationThreadPoolKeyOverride":null,"propertyValue_executionIsolationSemaphoreMaxConcurrentRequests":10,"propertyValue_fallbackIsolationSemaphoreMaxConcurrentRequests":10,"propertyValue_metricsRollingStatisticalWindowInMilliseconds":10000,"propertyValue_requestCacheEnabled":true,"propertyValue_requestLogEnabled":true,"reportingHosts":1}};
var mock_err = {"cluster":"callisto_primary","host":"co-callisto-svc5","data":{"type":"HystrixCommand","name":"UPDATE_CART","group":"cartGroup","currentTime":1422547476737,"ids":["11536317990252642","11536317894949480","11536318951477114","11536318164088176","11536318234611342","11536320860984164","11536321107859592","11536322621158389","11536322686785785","11536322960897135","11536323998061871","11536324616255487","11536324671242176","11536325107543390","11536325177063054"],"isCircuitBreakerOpen":false,"errorPercentage":33,"errorCount":5,"requestCount":15,"rollingCountCollapsedRequests":0,"rollingCountExceptionsThrown":0,"rollingCountFailure":0,"rollingCountFallbackFailure":0,"rollingCountFallbackRejection":0,"rollingCountFallbackSuccess":0,"rollingCountResponsesFromCache":0,"rollingCountSemaphoreRejected":0,"rollingCountShortCircuited":0,"rollingCountSuccess":15,"rollingCountThreadPoolRejected":0,"rollingCountTimeout":0,"currentConcurrentExecutionCount":0,"latencyExecute_mean":81,"latencyExecute":{"0":40,"25":53,"50":78,"75":99,"90":115,"95":136,"99":301,"100":301,"99.5":301},"latencyTotal_mean":81,"latencyTotal":{"0":40,"25":53,"50":78,"75":99,"90":115,"95":136,"99":301,"100":301,"99.5":301},"propertyValue_circuitBreakerRequestVolumeThreshold":20,"propertyValue_circuitBreakerSleepWindowInMilliseconds":5000,"propertyValue_circuitBreakerErrorThresholdPercentage":50,"propertyValue_circuitBreakerForceOpen":false,"propertyValue_circuitBreakerForceClosed":false,"propertyValue_circuitBreakerEnabled":true,"propertyValue_executionIsolationStrategy":"THREAD","propertyValue_executionIsolationThreadTimeoutInMilliseconds":3000,"propertyValue_executionIsolationThreadInterruptOnTimeout":true,"propertyValue_executionIsolationThreadPoolKeyOverride":null,"propertyValue_executionIsolationSemaphoreMaxConcurrentRequests":10,"propertyValue_fallbackIsolationSemaphoreMaxConcurrentRequests":10,"propertyValue_metricsRollingStatisticalWindowInMilliseconds":10000,"propertyValue_requestCacheEnabled":true,"propertyValue_requestLogEnabled":true,"reportingHosts":1}};
var errorchecker = require(__dirname+'/../lib/utils/errorchecker');
var store = require(__dirname+'/../lib/utils/store');
module.exports = {
	
	checkTest: function(test){
		var conf = require(__dirname+"/mockconfig.js")
		var error = errorchecker.check(mock_no_error_data.data);
		// console.log(error);
		test.equals(error,null);
		test.done();
	},

	checkError: function(test){
		var conf = require(__dirname+"/mockconfig.js")
		var error = errorchecker.check(mock_err.data);
		test.deepEqual(error,[ 'errorPercentage', 'errorCount' ]);
		test.done();
	},

	checkStore: function(test){
		var conf = require(__dirname+"/mockconfig.js")
		var error = errorchecker.check(mock_err.data);
		mock_err.error=error;
		store.update(mock_err);
		var errorObj = store.drain(mock_err);
		test.deepEqual(errorObj,{ UPDATE_CART: 
   		[ { group: 'cartGroup',
	       command: 'UPDATE_CART',
	       host: 'co-callisto-svc5',
	       timestamp: 1422547476737,
	       hystrixFields: { errorPercentage: 33, errorCount: 5 } } ] });
		test.done();
	}
}
