var async = require("async");
var Utility = require("../lib/Utility.js");
var View = require("../views/View.js");
var stack;

exports.getTitles = function (request,response) {
	stack = [];
	var requestUrl = request.url;
	View.writeHeader(response);
	if(requestUrl.indexOf("address=") == -1){
		View.writeAddressInUrl(response);
		return;
	}
	if(request.query.address instanceof Array){
		arrayLength = request.query.address.length;
		for(var counter = 0;counter < arrayLength; counter++){
			var urlToShow = request.query.address[counter];
			Utility.getUrlWithTitle(urlToShow,function(x2){
				var getCompleteTitle = function(callback){
					Utility.requestTitle(x2,function(title){
						callback(null,title);
					});
				}
				stack.push(getCompleteTitle);
			});			
		}
	}
	else{
		var address = request.query.address;
		var getCompleteTitle = function(callback){
			Utility.requestTitle(address,function(title){
				callback(null,title);
			});
		}
		stack.push(getCompleteTitle);
	}
	async.parallel(stack,function(err,result){
		if(err){
			console.log("error"+err);
		}
		View.writeTitleHeader(response);
		for(var i = 0;i<result.length;i++){
			View.writeTitle(response,result[i]);
		}
		View.writeTitleFooter(response);
		View.writeFooter(response);
	});
};