var http = require("http");

module.exports = {
	getUrlWithTitle : function(i, callback){
		return callback(i);
	},
	requestTitle : function(address,getTitle){
		var regex = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
		var queryStringUrl = address;
		var splitUrl = queryStringUrl.split("/");
		var validateQueryString = splitUrl[0].indexOf(".com") !== -1
		if(validateQueryString){
			var urlOpts = {host: splitUrl[0], path: splitUrl[1] == undefined ? "/": "/"+splitUrl[1] + "/", port: '80'};
			http.get(urlOpts, function (res) {
				res.on('data', function (chunk){
					try{
						var str=chunk.toString();
						var match = regex.exec(str);
						if (match && match[2]) {
							getTitle(((res.statusCode == 200) ? match[2] : "Not found") + " - " + queryStringUrl);
						}
					}
					catch(e){
						getTitle(e);
					}
				});
			}).on('error',function(e){
				getTitle("Got error: " + e.message);
			});
		}
		else{
			getTitle("Invalid Query");
		}
	}
}