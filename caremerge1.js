var express = require('express');
var http = require("http");

var app = express();


app.get("/I/want/title/", function (request,response) {

	var counterForWritingEnd = 0;
	var requestUrl = request.url;
	writeHeader(response);

	if(requestUrl.indexOf("address") == -1)
	{
		writeAddressInUrl(response);
		return;
	}

	if(requestUrl.indexOf('&') > -1)
	{
		var queryStringCount = getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
		if(queryStringCount == 1)
		{
			getSingleWebsiteTitle(request,response);
		}
		else
		{
			//get multi website title
			writeHeader(response);
			writeTitleHeader(response);

			for(var counter = 0;counter < queryStringCount;counter++)
			{
				var urlToShow = request.query.address[counter];
				console.log(urlToShow);
				var splitUrl = request.query.address[counter].split("/");

				var validateQueryString = splitUrl[0].indexOf(".com") !== -1
				
				if(validateQueryString)
				{
					var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
					var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;


					callbackClosure(urlToShow, function (x2){
						http.get(urlOpts, function (res) {

						res.on('end',function(){
							counterForWritingEnd++;

							if(counterForWritingEnd == queryStringCount)
							{
								writeTitleFooter(response);
								writeFooter(response);
							}
						}),
						//async call
						getTitleResponse(res,response,x2,false);

						}).on('error',function(e){
							console.log("Got error: " + e.message);
							writeError(response);
						});
					});
					
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
		getSingleWebsiteTitle(request,response);
	}


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


function getSingleWebsiteTitle(request,response)
{
	var queryStringUrl = request.query.address;
	var validateQueryString = queryStringUrl.indexOf(".com") !== -1
	if(validateQueryString)
	{
		var urlOpts = {host: queryStringUrl, path: "/", port: '80'};
		http.get(urlOpts, function (res) {

			getTitleResponse(res,response,queryStringUrl,true);

		}).on("error", function(e){
			console.log("Got error: " + e.message);
			writeError(response);
		});

	}
	else
	{
		//Invalid URL
		writeError(response);
	}
}

function getTitleResponse(res,response,queryStringUrl,isSingle)
{
	var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
	return res.on('data', function (chunk) {
		try
		{
			var str=chunk.toString();
			var match = re.exec(str);
			if (match && match[2]) {

				if(isSingle)writeTitleHeader(response);
				writeTitle(response,match[2],queryStringUrl);
				if(isSingle)writeTitleFooter(response);
				if(isSingle)writeFooter(response);
			}
		}
		catch(e)
		{
			console.log(e);
		}
	});
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

function writeTitle(response,title,url)
{
	if(!response.finished)
	{
		response.write("<li>" + url + " - "+title+"</li>");
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

function writeAddressInUrl(response)
{
	if(!response.finished)
	{
		response.write("<h1>Please write address in URL so as to get titles</h1>")
		writeFooter(response);
		response.end();
	}	
}