var express = require('express');
var http = require("http");

var app = express();

app.get("/I/want/title/", function (request,response) {

	var requestUrl = request.url;
	writeHeader(response);
		
	if(requestUrl.indexOf('&') > -1)
	{
		queryStringCount  = Object.keys(request.query.address).length;
		writeHeader(response);
		writeTitleHeader(response);

	  	for(var counter = 0;counter < queryStringCount;counter++)
		{
			var splitUrl = request.query.address[counter].split("/");
			var validateQueryString = splitUrl[0].indexOf(".com") !== -1

			if(validateQueryString)
			{
				var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
				var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

				var requestForError = http.get(urlOpts, function (res) {
					
					res.on('end',function(){
						writeTitleFooter(response);
						writeFooter(response);
					}),
				    res.on('data', function (chunk) {

				        var str=chunk.toString();
				        var match = re.exec(str);
				        if (match && match[2]) {
							console.log(queryStringCount +"-----" + counter);
							writeTitle(response,match[2]);
				        }
			
				    });
				}).on('error',function(e){
					console.log("Got error: " + e.message);
				});
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
			http.get(urlOpts, function (res) {
		    res.on('data', function (chunk) {

		        var str=chunk.toString();
		        var match = re.exec(str);
		        if (match && match[2]) {

					writeTitleHeader(response);
					writeTitle(response,match[2]);
					writeTitleFooter(response);
					writeFooter(response);
		        }
		    });
			}).on("error", function(e){
			  	console.log("Got error: " + e.message);
			});

		}
	}

	
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