var express = require('express');
var http = require("http");
var async = require("async");
var Utility = require("./Utility.js");


var app = express();
var stack =[];

app.get("/I/want/title/", function (request,response) {

	stack = [];
	var requestUrl = request.url;
	Utility.writeHeader(response);

	if(requestUrl.indexOf("address=") == -1)
	{
		Utility.writeAddressInUrl(response);
		return;
	}

	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = Utility.getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
		if(queryStringCount == 1)
		{
			var queryStringUrl = request.query.address;
			var validateQueryString = queryStringUrl.indexOf(".com") !== -1
			if(validateQueryString)
			{
				getSingleWebsiteTitle(request,response);
			}
			else
			{
				Utility.writeError(response);
			}
		}
		else
		{

			for(var counter = 0;counter < queryStringCount;counter++)
			{
				var urlToShow = request.query.address[counter];
				var splitUrl = request.query.address[counter].split("/");
				var validateQueryString = splitUrl[0].indexOf(".com") !== -1

				if(validateQueryString)
				{
					var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
					var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

					var requestForTitle = Utility.callbackClosure(urlToShow, function(x2){
						return GetTitleOfWeb(urlOpts,re,x2);	
					});

					stack.push(requestForTitle);
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
		var queryStringUrl = request.query.address;
		var validateQueryString = queryStringUrl.indexOf(".com") !== -1
		console.log("this");
		if(validateQueryString)
		{
			getSingleWebsiteTitle(request,response,queryStringUrl);
		}
		else
		{
			Utility.writeError(response);
		}
	}

	//async for parallel execution
	async.parallel(stack,function(err,result)
	{
		if(err)
		{
			console.log("error"+err);
		}

		Utility.writeTitleHeader(response);
		
		for(var i = 0;i<result.length;i++)
		{
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

function GetTitleOfWeb(urlOpts,re,queryStringUrl)
{
	//function has its own scope thats why separated in a function
	return requestForTitle = function(callback)
	{
		http.get(urlOpts, function (res) {

			res.on('data', function (chunk) {

				var str=chunk.toString();
				var match = re.exec(str);
				if (match && match[2]) {

					callback(null,((res.statusCode == 200) ? match[2] : "Not found") + " - " + queryStringUrl);
				}

			});
		}).on('error',function(e){
			callback(e.message,"");
		});
	}

}

function getSingleWebsiteTitle(request,response,queryStringUrl)
{
	var queryStringUrl = request.query.address;
	var urlOpts = {host: queryStringUrl, path: "/", port: '80'};
	var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

	var requestForTitle = GetTitleOfWeb(urlOpts,re,queryStringUrl);

	stack.push(requestForTitle);
}