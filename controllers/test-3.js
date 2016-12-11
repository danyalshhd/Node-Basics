var RSVP = require('rsvp');
var Utility = require("../lib/Utility.js");
var View = require("../views/View.js");

exports.getTitles = function (request,response) {
	var requestUrl = request.url;
	View.writeHeader(response);
	if(requestUrl.indexOf("address=") == -1){
		View.writeAddressInUrl(response);
		return;
	}
	if(request.query.address instanceof Array){
		var promise = request.query.address.map(function(urlToShow){
			return new RSVP.Promise(function(resolve,reject){
				Utility.requestTitle(urlToShow,function(title){
					resolve(title);
				});
			});
    	});
		RSVP.all(promise).then(function(responseText){
			View.writeTitleHeader(response);
			responseText.map(function(item){
				View.writeTitle(response,item);
			});
			View.writeTitleFooter(response);
			View.writeFooter(response);
		}).catch(function(error){
			console.log(error);
		});
	}
	else{
		var address = request.query.address;
		var promise = new RSVP.Promise(function(resolve,reject){
				Utility.requestTitle(address,function(title){
					resolve(title);
				});
			});
		promise.then(function(responseText){
			View.writeTitleHeader(response);
			View.writeTitle(response,responseText);
			View.writeTitleFooter(response);
			View.writeFooter(response);
		}).catch(function(error){
			console.log(error);
		});
	}
};