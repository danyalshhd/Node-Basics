var express = require('express');
var http = require("http");
var async = require("async");
var app = express();
var stack =[];

app.get("/I/want/title/", function (request,response) {

	stack = [];
	var requestUrl = request.url;
	writeHeader(response);

	if(requestUrl.indexOf("address") == -1)
	{
		writeAddressInUrl(response);
		return;
	}

	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
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
				writeError(response);
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

					var requestForTitle = callbackClosure(urlToShow, function(x2){
						return GetTitleOfWeb(urlOpts,re,x2);	
					});

					stack.push(requestForTitle);
				}
				else
				{
					writeError(response);
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
			writeError(response);
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

	});
	
});

function callbackClosure(i, callback) 
{
	return callback(i);
}

app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);

function getQueryStringCount(url,queryStringCount)
{
	var splitUrl = url.split("&");

	var lengthQueryString = 0;
	if(splitUrl.length == 2 && queryStringCount > 5)
	{
		lengthQueryString = 1;
	}
	else
	{
		lengthQueryString = queryStringCount;
	}

	return lengthQueryString;
}

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

					callback(null,match[2] + "--" + queryStringUrl);
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

function writeHeader(response)
{
	if(!response.finished)
	{
		response.write("<html>");
		response.write("<head><title>Caremerge");
		response.write("</title></head>");
		response.write("<body>");
	}
}

function writeFooter(response)
{
	if(!response.finished)
	{
		response.write("</body>");
		response.write("</html>");	
		response.end();
	}
}

function writeTitleHeader(response)
{
	if(!response.finished)
	{
		response.write("<h1> Following are the titles of given websites: </h1>");
		response.write("<ul>")
	}
}

function writeTitleFooter(response)
{
	if(!response.finished)
	{
		response.write("</ul>")
	}
}

function writeTitle(response,title)
{
	if(!response.finished)
	{
		response.write("<li>" + title + "</li>");
	}
}

function writeAddressInUrl(response)
{
	if(!response.finished)
	{
		response.write("<h1>Please write address in URL so as to get titles</h1>")
		writeFooter(response);
		response.end();
	}	
}

function writeError(response)
{	
	if(!response.finished)
	{
		response.write("<h1>Invalid URL</h1>")
		writeFooter(response);
		response.end();
	}
}
