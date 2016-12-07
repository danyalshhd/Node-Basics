var express = require('express');
var http = require("http");
var RSVP = require('rsvp');
var Utility = require("./Utility.js");
var counterForWritingEnd = 0;

var app = express();

app.get("/I/want/title/", function (request,response) {

	var requestUrl = request.url;
	Utility.writeHeader(response);

	if(requestUrl.indexOf("address=") == -1)
	{
		Utility.writeAddressInUrl(response);
		return;
	}

	counterForWritingEnd = 0;
	//For querystrings which contains '&'
	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = Utility.getQueryStringCount(requestUrl,Object.keys(request.query.address).length);
		
		if(queryStringCount == 1)
		{
			getSingleAddressTitle(request,response);
		}	
		else
		{
			Utility.writeTitleHeader(response);

			for(var counter = 0;counter < queryStringCount;counter++)
			{
				var urlToShow = request.query.address[counter]; 
				var splitUrl = request.query.address[counter].split("/");
				var validateQueryString = splitUrl[0].indexOf(".com") !== -1

				if(validateQueryString)
				{
					var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};

					Utility.callbackClosure(urlToShow,function(x2){
						return getTitle(urlOpts).then(function(responseText){
							//console.log(responseText + "----then");
							Utility.writeTitle(response,responseText + " - " + x2);
							counterForWritingEnd++;
							
							if(counterForWritingEnd == queryStringCount)
							{
								Utility.writeTitleFooter(response);
								Utility.writeFooter(response);
							}
						}).catch(function(error){
							console.log(error);
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
		//For querystring which contains no '&'
		getSingleAddressTitle(request,response);
	}
});


app.get("*", function (request,response) {
	response.status(404).send('Not found');
});

app.listen(8080);

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
	        	resolve(((res.statusCode == 200) ? match[2] : "Not found"));
	        }
	    });
		}).on("error", function(e){
			reject(e.message);
		});
	});

	return promise;
}

var getSingleAddressTitle = function(request,response)
{
	var queryStringUrl = request.query.address;
	var validateQueryString = queryStringUrl.indexOf(".com") !== -1
	if(validateQueryString)
	{
		var urlOpts = {host: queryStringUrl, path: "/", port: '80'};

		getTitle(urlOpts).then(function(responseText)
		{
			Utility.writeTitleHeader(response);
			Utility.writeTitle(response,responseText + " - " + queryStringUrl);
			Utility.writeTitleFooter(response);
			Utility.writeFooter(response);

		}).catch(function(error)
		{
			console.log(error);
		});
	}
	else
	{
		Utility.writeError(response);
	}	
}