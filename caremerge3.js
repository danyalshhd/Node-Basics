var express = require('express');
var http = require("http");
var RSVP = require('rsvp');
var counterForWritingEnd = 0;

var app = express();

//return promise object
var getTitle = function(urlOpts)
{
	var promise = new RSVP.Promise(function(resolve,reject)
	{
		var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

		http.get(urlOpts, function (res) {
			res.on('data', function (chunk) {
	    	//callback
	    	var str=chunk.toString();
	    	var match = re.exec(str);
	    	if (match && match[2]) {
	        	//get the title
	        	resolve(match[2]);
	        }
	    });
		}).on("error", function(e){
			reject(e.message);
		});
	});

	return promise;
}

app.get("/I/want/title/", function (request,response) {

	var requestUrl = request.url;
	writeHeader(response);

	if(requestUrl.indexOf("address") == -1)
	{
		writeAddressInUrl(response);
		return;
	}

	counterForWritingEnd = 0;
	//For querystrings which contains '&'
	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
		if(queryStringCount == 1)
		{
			var queryStringUrl = request.query.address;
			var validateQueryString = queryStringUrl.indexOf(".com") !== -1
			if(validateQueryString)
			{
				var urlOpts = {host: queryStringUrl, path: "/", port: '80'};

				getTitle(urlOpts).then(function(responseText)
				{
					writeTitleHeader(response);
					writeTitle(response,responseText + "--" + queryStringUrl);
					writeTitleFooter(response);
					writeFooter(response);

				}).catch(function(error)
				{
					console.log(error);
				});
			}
			else
			{
				writeError(response);
			}
		}	
		else
		{
			writeTitleHeader(response);

			for(var counter = 0;counter < queryStringCount;counter++)
			{
				var urlToShow = request.query.address[counter]; 
				var splitUrl = request.query.address[counter].split("/");
				var validateQueryString = splitUrl[0].indexOf(".com") !== -1

				if(validateQueryString)
				{
					var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};

					callbackClosure(urlToShow,function(x2){
						return getTitle(urlOpts).then(function(responseText){
							//console.log(responseText + "----then");
							writeTitle(response,responseText + "--" + x2);
							counterForWritingEnd++;
							
							if(counterForWritingEnd == queryStringCount)
							{
								writeTitleFooter(response);
								writeFooter(response);
							}
						}).catch(function(error){
							console.log(error);
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
		//For querystring which contains no '&'
		var queryStringUrl = request.query.address;
		var validateQueryString = queryStringUrl.indexOf(".com") !== -1
		if(validateQueryString)
		{
			var urlOpts = {host: queryStringUrl, path: "/", port: '80'};

			getTitle(urlOpts).then(function(responseText)
			{
				writeTitleHeader(response);
				writeTitle(response,responseText + "--" + queryStringUrl);
				writeTitleFooter(response);
				writeFooter(response);

			}).catch(function(error)
			{
				console.log(error);
			});
		}
		else
		{
			writeError(response);
		}
	}
});


app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);

function callbackClosure(i, callback) 
{
	return callback(i);
}

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
