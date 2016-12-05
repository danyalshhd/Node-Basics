var express = require('express');
var http = require("http");
var async = require("async");
var app = express();
var stack =[];

function GetTitleOfWeb(urlOpts,re)
{
	//function has its own scope thats why separated in a function
	return requestForTitle = function(callback)
	{
		http.get(urlOpts, function (res) {
		
	    res.on('data', function (chunk) {

	        var str=chunk.toString();
	        var match = re.exec(str);
	        if (match && match[2]) {
				
				callback(null,match[2]);
	        }

	    });
		}).on('error',function(e){
			callback(e.message,"");
		});
	}

}

app.get("/I/want/title/", function (request,response) {

	stack = [];
	var requestUrl = request.url;
	writeHeader(response);
		
	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = Object.keys(request.query.address).length;
		
	  	for(var counter = 0;counter < queryStringCount;counter++)
		{
			var splitUrl = request.query.address[counter].split("/");
			var validateQueryString = splitUrl[0].indexOf(".com") !== -1

			if(validateQueryString)
			{
				var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
				var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

				var requestForTitle = GetTitleOfWeb(urlOpts,re);
				stack.push(requestForTitle);
			}
		}

	}
	else
	{
		var queryStringUrl = request.query.address;
		var validateQueryString = queryStringUrl.indexOf(".com") !== -1
		if(validateQueryString)
		{
			var urlOpts = {host: queryStringUrl, path: "/", port: '80'};
			var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

			var requestForTitle = function (callback){
				http.get(urlOpts, function (res) {
			    res.on('data', function (chunk) {

			        var str=chunk.toString();
			        var match = re.exec(str);
			        if (match && match[2]) {

			        	callback(null,match[2]);
			        }
			    });
				}).on("error", function(e){
				  	callback(e.message,"");
				});
			}

			stack.push(requestForTitle);

		}
	}

	//async for parallel execution
	async.parallel(stack,function(err,result)
	{
		if(err)
		{
			console.log("error"+err);
		}

		writeTitleHeader(response);
		
		for(var i = 0;i<result.length;i++)
		{
			writeTitle(response,result[i]);
		}

		writeTitleFooter(response);
		writeFooter(response);
		console.log(result.length);

	});
	
});

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);

function writeHeader(response)
{
	  response.write("<html>");
	  response.write("<head><title>Caremerge");
	  response.write("</title></head>");
	  response.write("<body>");
}

function writeFooter(response)
{
	response.write("</body>");
	response.write("</html>");	
	response.end();
}

function writeTitleHeader(response)
{
	response.write("<h1> Following are the titles of given websites: </h1>");
	response.write("<ul>")
}

function writeTitleFooter(response)
{
	response.write("</ul>")
}

function writeTitle(response,title)
{
	response.write("<li>" + title + "</li>");
}