var express = require('express');
var Utility = require("./Utility.js");
var app = express();

app.get("/I/want/title/", function (request,response) {
	var counterForWritingEnd = 0;
	var requestUrl = request.url;
	var arrayLength;
	if(requestUrl.indexOf("address=") == -1){
		Utility.writeAddressInUrl(response);
		return;
	}
	Utility.writeHeader(response);
	Utility.writeTitleHeader(response);

	if(request.query.address instanceof Array){
		arrayLength = request.query.address.length;
		for(var counter = 0;counter < arrayLength; counter++){
			var urlToShow = request.query.address[counter];
			Utility.requestTitle(urlToShow,function(title){
				counterForWritingEnd++;
				Utility.writeTitle(response,title);
				if(arrayLength == counterForWritingEnd){
					Utility.writeTitleFooter(response);
					Utility.writeFooter(response);
				}
			});
		}
	}
	else{
		var address = request.query.address;
		Utility.requestTitle(address,function(title){
			Utility.writeTitle(response,title);
			Utility.writeTitleFooter(response);
			Utility.writeFooter(response);
		});
	}
});

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);