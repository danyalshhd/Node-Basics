var express = require('express');
var http = require("http");
var Utility = require("./Utility.js");

var app = express();

app.get("/I/want/title/", function (request,response) {

	var counterForWritingEnd = 0;
	var requestUrl = request.url;
	Utility.writeHeader(response);

	if(requestUrl.indexOf("address=") == -1)
	{
		Utility.writeAddressInUrl(response);
		return;
	}

	if(requestUrl.indexOf('&') > -1)
	{
		var queryStringCount = Utility.getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
		if(queryStringCount == 1)
		{
			getSingleWebsiteTitle(request,response);
		}
		else
		{
			//get multi website title
			Utility.writeHeader(response);
			Utility.writeTitleHeader(response);

			for(var counter = 0;counter < queryStringCount;counter++)
			{
				var urlToShow = request.query.address[counter];
				var splitUrl = request.query.address[counter].split("/");

				var validateQueryString = splitUrl[0].indexOf(".com") !== -1
				
				if(validateQueryString)
				{
					var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
					var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;


					Utility.callbackClosure(urlToShow, function (x2){
						http.get(urlOpts, function (res) {

						res.on('end',function(){
							counterForWritingEnd++;

							if(counterForWritingEnd == queryStringCount)
							{
								Utility.writeTitleFooter(response);
								Utility.writeFooter(response);
							}
						}),
						//async call
						showTitleResponse(res,response,x2,false);

						}).on('error',function(e){
							console.log("Got error: " + e.message);
							Utility.writeError(response);
						});
					});
					
				}
				else
				{
					Utility.writeError(response);
					break;
				}
			}
		}

	}
	else
	{
		getSingleWebsiteTitle(request,response);
	}


});

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);


function getSingleWebsiteTitle(request,response)
{
	var queryStringUrl = request.query.address;
	var validateQueryString = queryStringUrl.indexOf(".com") !== -1
	if(validateQueryString)
	{
		var urlOpts = {host: queryStringUrl, path: "/", port: '80'};
		http.get(urlOpts, function (res) {

			showTitleResponse(res,response,queryStringUrl,true);

		}).on("error", function(e){
			console.log("Got error: " + e.message);
			Utility.writeError(response);
		});

	}
	else
	{
		//Invalid URL
		Utility.writeError(response);
	}
}

function showTitleResponse(res,response,queryStringUrl,isSingle)
{
	var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
	return res.on('data', function (chunk) {
		try
		{
			var str=chunk.toString();
			var match = re.exec(str);
			if (match && match[2]) {

				if(isSingle)Utility.writeTitleHeader(response);
				Utility.writeTitle(response,((res.statusCode == 200) ? match[2] : "Not found") + " - " + queryStringUrl);
				if(isSingle)Utility.writeTitleFooter(response);
				if(isSingle)Utility.writeFooter(response);
			}
		}
		catch(e)
		{
			console.log(e);
		}
	});
}

