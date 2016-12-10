var express = require('express');
var async = require("async");
var Utility = require("./Utility.js");
var app = express();
var stack;

app.get("/I/want/title/", function (request,response) {
	stack = [];
	var requestUrl = request.url;
	Utility.writeHeader(response);
	if(requestUrl.indexOf("address=") == -1){
		Utility.writeAddressInUrl(response);
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
		Utility.writeTitleHeader(response);
		for(var i = 0;i<result.length;i++){
			Utility.writeTitle(response,result[i]);
		}
		Utility.writeTitleFooter(response);
		Utility.writeFooter(response);
	});
});

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);
