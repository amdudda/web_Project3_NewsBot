var express = require('express');
var request = require('request');
var router = express.Router();

var G_APIKEY = process.env.GUARDIAN_API_KEY; 
var newsArray = [];
var GuardianDone = false;

/* GET home page. */
router.get('/', function(req, res, next) {

	fetchGuardianData();
	nytDone = true;

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
		//myNews[i].itemDate = itemDate;
		//myNews[i].itemTime = itemTime;
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
	var curDateStamp = new Date();
	console.log(curDateStamp);

	var fourHours = 4*60*60*1000;
	var fourHoursAgo = new Date(curDateStamp - fourHours);

	var twentyfourHours = 3*24*60*60*1000;
	var twentyfourHoursAgo = new Date(curDateStamp - (3 * twentyfourHours) );

	console.log("ISO string:");
	console.log(twentyfourHoursAgo.toISOString());

	// compose our URL
	var requestURL = "http://content.guardianapis.com/search?from-date=" + fourHoursAgo.toISOString() + "&order-by=oldest&q=transgender&api-key=" + G_APIKEY;
	return requestURL;
}

module.exports = router;
