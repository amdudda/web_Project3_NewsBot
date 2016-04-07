/*
 * This modifies original app.js for the purpose of generating tweets.
 */

// API keys
var G_APIKEY = process.env.GUARDIAN_API_KEY; 
var NYT_APIKEY = process.env.NYT_API_KEY;
var BING_APIKEY = process.env.BING_API_KEY;

// required modules
var express = require('express');
var request = require('request');
var router = express.Router();
var Bing = require('node-bing-api')({ accKey: BING_APIKEY });

// global variables
var newsArray = [];
var GuardianDone = false;
var nytDone = false;
var BingDone = false;
var curDateStamp;
	var threeDays = 3*24*60*60*1000;
	var twentfourHours = 24*60*60*1000;
	var fourHours = 4*60*60*1000;
var timeInterval;

/* GET home page. */
router.get('/', function(req, res, next) {
	newsArray = [];  // clear the array before fetching data
	curDateStamp = new Date();
	timeInterval = new Date(curDateStamp - threeDays );
	fetchGuardianData();
	fetchNYTData();
	fetchBingData();

	setInterval( function() {
		// render the page once all processes are done
		if (GuardianDone && nytDone && BingDone) {
			console.log("news feed homepage requested");
			// sort the array first!
			newsArray.sort(sortByDate);
			res.render('index', { title: 'Transgender News Feed', headlines: newsArray });
			clearInterval(this);
		}
	}, 1000);
});

// function to sort news items from newest to oldest date
function sortByDate(x,y){
	return (new Date(y.timeStamp) - new Date(x.timeStamp))
}

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
	//console.log("guardian data:");
	//console.log(myNews[0]);
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

	// compose our URL
	var requestURL = "http://content.guardianapis.com/search?from-date=" + timeInterval.toISOString() + "&order-by=oldest&q=transgender&api-key=" + G_APIKEY;
	return requestURL;
}

/*
 * Process data from New York Times
 */
function fetchNYTData() {
	// set my API request properties
	// TODO: In twitter bot, we need previous day so we can check for stuff in cases where it kicks off at, say, 1am.
	//build a string for begin date
	myBeginDate = getBeginDate();
	
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
	//console.log("nyt data:");
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
			'itemTime': itemTime,
			'summary': myNews.abstract
			}
		newsArray.push(myItemInfo);
	}

}

function getBeginDate() {

myBeginDate = "" + timeInterval.getFullYear(); 
	// from http://stackoverflow.com/questions/5366849/convert-1-to-0001-in-javascript :
	var str = "" + (timeInterval.getMonth() + 1) 
	var pad = "00"
	var ans = pad.substring(0, pad.length - str.length) + str;
	// append month to date string
	myBeginDate += ans;
	str2 = timeInterval.getDate();
	ans2 = pad.substring(0, pad.length - str.length) + str;
	myBeginDate += ans2;
	return myBeginDate;
}

/*
 * fetch and process Bing data
 */
function fetchBingData(){
	Bing.news("transgender", {
		top: 15,  // Number of results (max 15) 
		newsSortBy: "Date", //Choices are: Date, Relevance 
	}, function(error, res, body){
		if (!error) {
			parseBingData(body.d.results);
		} else {
			console.log("Error retrieving from Bing: " + error);
		}
	});
	BingDone = true;
}

function parseBingData(newsItems){
	//console.log('bing data:');
	//console.log(newsItems[0]);
	for (var i=0; i<newsItems.length; i++) {
		var newsItem = newsItems[i];
		var headline = newsItem.Title;
		var itemUrl = newsItem.Url;
		//var itemDate = newsItems[i].Date;
		var itemTimestamp = newsItem.Date;
		var itemDate = itemTimestamp.substring(0,10);
		var itemTime = itemTimestamp.substring(11,16);
		var description = newsItem.Description
		var itemData = {
			'source': 'Bing',
			'webTitle': headline, 
			'webUrl': itemUrl, 
			'timeStamp': itemTimestamp,
			'itemDate': itemDate,
			'itemTime': itemTime,
			'summary': description
			};
		//console.log("item" + i + ": " + JSON.stringify(itemData) + "\n");
		newsArray.push(itemData);
	}
}

module.exports = router;
