var express = require('express');
var request = require('request');
var router = express.Router();

var G_APIKEY = process.env.GUARDIAN_API_KEY; 
var NYT_APIKEY = process.env.NYT_API_KEY;
var newsArray = [];
var GuardianDone = false;
var nytDone = false
var curDateStamp;
	var twentyfourHours;
	var twentyfourHoursAgo;

/* GET home page. */
router.get('/', function(req, res, next) {
	curDateStamp = new Date();
	twentyfourHours = 3*24*60*60*1000;
	twentyfourHoursAgo = new Date(curDateStamp - (3 * twentyfourHours) );
	fetchGuardianData();
	fetchNYTData();

	setInterval( function() {
		// render the page once all processes are done
		if (GuardianDone && nytDone) {
			res.render('index', { title: 'Transgender News Feed', headlines: newsArray });
			clearInterval(this);
		}
	}, 1000);
});

/*
 * Process data from The Guardian
 */
function fetchGuardianData() {
	request ( fetchNewsUrl() , function(error, guardianResponse, body) {
		if (!error) {
			// process Guardian Data
			parseGuardianData(JSON.parse(body));
		}
		else {
			console.log("Error retrieving from Guardian: " + error);
		}
		// notify the system that we're done getting Guardian Data.	
		GuardianDone = true;
	});	
}

function parseGuardianData(jsonResp) {
	var myNews = jsonResp.response.results;
	// Iterate through results, parse date and time, and append to that result
	for (i=0; i<myNews.length; i++){
		var itemTimestamp = myNews[i].webPublicationDate;
		var itemDate = itemTimestamp.substring(0,10);
		var itemTime = itemTimestamp.substring(11,16);

		var myItemInfo = { 
			'source': 'Guardian',
			'webUrl': myNews[i].webUrl, 
			'webTitle': myNews[i].webTitle,
			'timeStamp': itemTimestamp,
			'itemDate': itemDate,
			'itemTime': itemTime
			}
		newsArray.push(myItemInfo);
	}
}

function fetchNewsUrl() {
	// this isn't quite Proper(tm), but it gets the job done.

	var fourHours = 4*60*60*1000;
	var fourHoursAgo = new Date(curDateStamp - fourHours);

	// compose our URL
	var requestURL = "http://content.guardianapis.com/search?from-date=" + twentyfourHoursAgo.toISOString() + "&order-by=oldest&q=transgender&api-key=" + G_APIKEY;
	return requestURL;
}

/*
 * Process data from New York Times
 */
function fetchNYTData() {
	// set my API request properties
	// TODO: Set begin date programmatically.  In twitter bot, we need previous day so we can check for stuff in cases where it kicks off at, say, 1am.
	var twentyfourHours = 3*24*60*60*1000;
	var twentyfourHoursAgo = new Date(curDateStamp - (3 * twentyfourHours) );
	//build a string for begin date
	myBeginDate = "" + twentyfourHoursAgo.getFullYear(); 
	// from http://stackoverflow.com/questions/5366849/convert-1-to-0001-in-javascript :
	var str = "" + (twentyfourHoursAgo.getMonth() + 1) 
	var pad = "00"
	var ans = pad.substring(0, pad.length - str.length) + str;
	// append month to date string
	myBeginDate += ans;
	myBeginDate += twentyfourHoursAgo.getDate();
	console.log(myBeginDate);
	
	var baseUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json";
	var params = {
		'api-key': NYT_APIKEY,
		'q': 'transgender',
		'begin_date': myBeginDate
		}

	// send the request
	request( {uri: baseUrl, qs: params} , function(error, ntyResp, body) {
		// for now, just log the response body
		//console.log(body);
		if (!error) {
			nytData = JSON.parse(body);
			// send the data to be parsed and added to the news array
			parseNytData(nytData);
		}
		else {
			console.log("Error retrieving from NYT: " + error);
		}
		//notify the system we're done processing the data
		nytDone = true;
	});

}

function parseNytData(myData) {
	// here we parse the NYT data.  The articles we want to show are in the docs element of the JSON object.
	var newsItems = myData.response.docs;
	//console.log(newsItems[0]);
	for (var j = 0; j<newsItems.length; j++) {
		var myNews = newsItems[j];
		// TODO: remove items outside our time window.
		var itemTimestamp = myNews.pub_date;
		var itemDate = itemTimestamp.substring(0,10);
		var itemTime = itemTimestamp.substring(11,16);
		var myItemInfo = { 
			'source': 'NYT',
			'webUrl': myNews.web_url, 
			'webTitle': myNews.headline.main,
			'timeStamp': itemTimestamp,
			'itemDate': itemDate,
			'itemTime': itemTime
			}
		newsArray.push(myItemInfo);
	}

}

module.exports = router;
