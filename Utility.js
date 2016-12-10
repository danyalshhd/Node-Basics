var http = require("http");

module.exports = {
	writeHeader : function(response)
	{
		if(!response.finished)
		{
			response.write("<html>");
			response.write("<head><title>Caremerge");
			response.write("</title></head>");
			response.write("<body>");
		}
	},

	writeFooter : function(response)
	{
		if(!response.finished)
		{
			response.write("</body>");
			response.write("</html>");	
			response.end();
		}
	},

	writeTitleHeader : function(response)
	{
		if(!response.finished)
		{
			response.write("<h1> Following are the titles of given websites: </h1>");
			response.write("<ul>")
		}
	},

	writeTitleFooter : function(response)
	{
		if(!response.finished)
		{
			response.write("</ul>")
		}
	},

	writeTitle : function(response,title)
	{
		if(!response.finished)
		{
			response.write("<li>" + title + "</li>");
		}
	},

	writeError : function(response)
	{	
		if(!response.finished)
		{
			response.write("<h1>Invalid URL</h1>")
			this.writeFooter(response);
			response.end();
		}
	},

	writeAddressInUrl : function(response)
	{
		if(!response.finished)
		{
			response.write("<h1>Please write address in URL so as to get titles</h1>")
			this.writeFooter(response);
			response.end();
		}	
	},

	getQueryStringCount : function(url,queryStringCount)
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
	},

	getUrlWithTitle : function(i, callback) 
	{
		return callback(i);
	},

	requestTitle : function(address,getTitle)
	{
		var regex = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
		var queryStringUrl = address;

		var splitUrl = queryStringUrl.split("/");
		var validateQueryString = splitUrl[0].indexOf(".com") !== -1
		
		if(validateQueryString)
		{
			var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
			
			http.get(urlOpts, function (res) {
				res.on('data', function (chunk) {
					try
					{
						var str=chunk.toString();
						var match = regex.exec(str);
						if (match && match[2]) {
							
							getTitle(((res.statusCode == 200) ? match[2] : "Not found") + " - " + queryStringUrl);
						}
					}
					catch(e)
					{
						getTitle(e);
					}
				});
			}).on('error',function(e){
				getTitle("Got error: " + e.message);
			});
		}
		else
		{
			getTitle("Invalid Query");
		}
	}
}