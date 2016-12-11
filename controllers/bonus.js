var RSVP = require('rsvp');
var Rx = require('rxjs');
var Utility = require("../lib/Utility.js");
var View = require("../views/View.js");

exports.getTitles = function (request,response){
	var counterForWritingEnd=0;
	var requestUrl = request.url;
	View.writeHeader(response);
	if(requestUrl.indexOf("address=") == -1){
		View.writeAddressInUrl(response);
		return;
	}
	View.writeTitleHeader(response);
	if(request.query.address instanceof Array){
		var promises = request.query.address.map(function(urlToShow){
			return new RSVP.Promise(function(resolve,reject){
				Utility.requestTitle(urlToShow,function(title){
					resolve(title);
				});
			});
    	});
    	promises.map(function(promise){
			const source$ = Rx.Observable.fromPromise(promise);
			source$.subscribe(titleName=>{
				View.writeTitle(response,titleName);
				counterForWritingEnd++;
				if(counterForWritingEnd == promises.length){
					View.writeTitleFooter(response);
					View.writeFooter(response);	
				}
			});		
    	});
	}
	else{
		var address = request.query.address;
		var promise = new RSVP.Promise(function(resolve,reject){
			Utility.requestTitle(address,function(title){
				resolve(title);
			});
		});
		const source$ = Rx.Observable.fromPromise(promise);
		source$.subscribe(titleName=>{
			View.writeTitle(response,titleName);
			View.writeTitleFooter(response);
			View.writeFooter(response);
		});
	}	
};