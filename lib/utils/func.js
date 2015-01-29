
module.exports= (function(){
	return{
		map: function(data,func){
	        var isArray = (data instanceof Array);
	        var output = (isArray) ? [] : {};
	        for(var i in data){
	            if (!isArray && !data.hasOwnProperty(i)){
	                continue;
	            }
	            output[i] = func(data[i],i);
	        }
	        return output;
	    },
	
		filter: function(data,func){
			var isArray = (data instanceof Array);
	        var output = (isArray) ? [] : {};
	        for(var i in data){
	            if (!isArray && !data.hasOwnProperty(i)){
	                continue;
	            }
	            if(func(data[i],i)){
	            	output[i] = data[i];
	        	}
	        }
	        return output;
	    }
	}
}).call(this);