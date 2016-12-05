var express = require('express');
var http = require("http");
var RSVP = require('rsvp');
var Rx = require('rxjs');
var counterForWritingEnd = 0;

var app = express();

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
		queryStringCount = getQueryStringCount(requestUrl,Object.keys(request.query.address).length);

		if(queryStringCount == 1)
		{
				//For querystring which contains no '&'
			var queryStringUrl = request.query.address;
			var validateQueryString = queryStringUrl.indexOf(".com") !== -1
			if(validateQueryString)
			{
				var urlOpts = {host: queryStringUrl, path: "/", port: '80'};
				
				var getTitlePromise = getTitle(urlOpts,queryStringUrl)
				const source$ = Rx.Observable.fromPromise(getTitlePromise);
				source$.subscribe(titleName=>{
					writeTitleHeader(response);
					writeTitle(response,titleName);
					writeTitleFooter(response);
					writeFooter(response);
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

					var getTitlePromise = callbackClosure(urlToShow,function(x2){
						return getTitle(urlOpts,x2);
					}); 

					const source$ = Rx.Observable.fromPromise(getTitlePromise);
					source$.subscribe(titleName=>{
						// writeTitleHeader(response);
						writeTitle(response,titleName);
						counterForWritingEnd++;
						if(counterForWritingEnd == queryStringCount)
						{
							writeTitleFooter(response);
							writeFooter(response);	
						}
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
			
			var getTitlePromise = getTitle(urlOpts,queryStringUrl)
			const source$ = Rx.Observable.fromPromise(getTitlePromise);
			source$.subscribe(titleName=>{
				writeTitleHeader(response);
				writeTitle(response,titleName);
				writeTitleFooter(response);
				writeFooter(response);
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

function callbackClosure(i, callback) 
{
	return callback(i);
}

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

//return promise object
var getTitle = function(urlOpts,urlToShow)
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
	        	resolve(match[2] + "--" + urlToShow);
	        }
	    });
		}).on("error", function(e){
			reject(e.message);
		});
	});

	return promise;
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
