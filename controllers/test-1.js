var Utility = require("../lib/Utility.js");
var View = require("../views/View.js");

exports.getTitles = function (request,response) {
	var counterForWritingEnd = 0;
	var requestUrl = request.url;
	var arrayLength;
	if(requestUrl.indexOf("address=") == -1){
		View.writeAddressInUrl(response);
		return;
	}
	View.writeHeader(response);
	View.writeTitleHeader(response);
	if(request.query.address instanceof Array){
		arrayLength = request.query.address.length;
		for(var counter = 0;counter < arrayLength; counter++){
			var urlToShow = request.query.address[counter];
			Utility.requestTitle(urlToShow,function(title){
				counterForWritingEnd++;
				View.writeTitle(response,title);
				if(arrayLength == counterForWritingEnd){
					View.writeTitleFooter(response);
					View.writeFooter(response);
				}
			});
		}
	}
	else{
		var address = request.query.address;
		Utility.requestTitle(address,function(title){
			View.writeTitle(response,title);
			View.writeTitleFooter(response);
			View.writeFooter(response);
		});
	}
};