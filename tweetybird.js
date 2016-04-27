/*
 * This modifies original app.js for the purpose of generating tweets.
 */

// API keys
var G_APIKEY = process.env.GUARDIAN_API_KEY; 
var NYT_APIKEY = process.env.NYT_API_KEY;
var BING_APIKEY = process.env.BING_API_KEY;

// required modules
var request = require('request');
var Bing = require('node-bing-api')({ accKey: BING_APIKEY });
var Twitter = require('twitter');

// Twitter API keys
// TODO: setup account and start doing test tweeting!
var client = new Twitter({
  consumer_key: process.env.TNW_CONSUMER_KEY,
  consumer_secret: process.env.TNW_CONSUMER_SECRET,
  access_token_key: process.env.TNW_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TNW_ACCESS_TOKEN_SECRET
});

// set up database connection
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost:27017/transnews');
// connect to our database Schema
var NewsItem = require('./models/newsitems.js');

// global variables
var searchterm = "transgender"; // our search term
var newsArray = [];  // array to store news items
var tweetables = []; // array storing only new news items
var GuardianDone = false;  // these help the app decide when all results have been processed
var nytDone = false;
var BingDone = false;
var curDateStamp;
	var threeDays = 3*24*60*60*1000;
	var twentyfourHours = 24*60*60*1000;
	var fourHours = 4*60*60*1000;
	var eightHours = 8*60*60*1000;  // because Heroku only lets you have 3 scheduled tasks.
var timeInterval;

// fetch data, then tweet it in callback.
fetchNewsData(postAndSave);

function postAndSave(){
	storeNewsItems(sendTweets);
};

// a function to tweet data
function sendTweets() {
	console.log("tweet " + tweetables.length + " articles?");
	var n = 0;
	var threeMinutes = 3*60*1000;
	// I want to send space my tweets out a couple minutes apart?
	// only tweet if there's stuff to tweet
	if (tweetables.length > 0){	
		setInterval( function(){
			// tweet our news item
			newsItem = NewsItem(tweetables[n]);
			console.log(newsItem);
			var myTweet = "[" + newsItem.source + "] ";
			myTweet += newsItem.webTitle;
			myTweet = myTweet.substring(0,119) + "… ";
			myTweet += newsItem.webUrl;
			console.log("#" + n + ") " + myTweet);
			/* TODO: TURN THIS ON AFTER I HAVE CREATED TWITTER ACCT
			client.post('statuses/update', {status: myTweet},  function(error, tweet, response){
				  if (error) throw error;
				  console.log(tweet);  // Tweet body. 
				  console.log(response);  // Raw response object. 
			});
			*/
			n++; // increment to next news item.
			// stop the timer once we've tweeted everything.
			if (n >= tweetables.length) {
				clearInterval(this); 
				// and close my connection when done
				mongoose.connection.close();
			}
		}, 1000);
	}
	else {
		// just close my connection
		mongoose.connection.close();
	}
};

// a function to add data to database
function storeNewsItems(callback){
	console.log("storing " + newsArray.length + " items");
	tweetables = []; // clear the array in case there's lingering data...
	// iterate through newsArray and add each item to the database and to tweetables array
	for (i=0; i<newsArray.length; i++) 
	{
		var article = newsArray[i];
		var newNewsItem = NewsItem(article);
		//var consolestring = "item # " + i + ":\n" + JSON.stringify(newNewsItem);
		//console.log(newsArray.length);
		var processed = 0; // total number of articles processed so we know when to trigger the callback.
		newNewsItem.save( function(err) {
			//console.log("saving article #" + i);
			if (err) 
			{
				if (err.name == "ValidationError") 
				{
					console.log('Invalid data in record #'+ i + ':\n' + article);
					console.log('You may need to add this record manually.');
				}
				else if (err.code == 11000) 
				{
					console.log('An article already exists in the database. Skipping the record.');
				}
				else 
				{
					// some other error happened we haven't foreseen
					console.log('An unexpected error occurred:\n' +err);  
				}
			}
			else 
			{
				// news item is tweetable, push it to the tweetables array
				// console.log("saved #" + processed);
				tweetables.push(newsArray[processed]);
			}	
		
			processed++;  // increment number of articles processed
			// put a callback here to start tweeting after the data has been stored
			// console.log("processed #" + processed);		
			if (processed == newsArray.length) {
				console.log(tweetables.length + " new items found");
				callback();
			}
		}); 
		//console.log("Added " + i + "-th news item!");
	}
	
};

/*
 * function to fetch data for Twitter to post.
 * takes a callback function to work with data once it's been retrieved
 */
function fetchNewsData(callback) {

	newsArray = [];  // clear the array before fetching data
	curDateStamp = new Date();
	timeInterval = new Date(curDateStamp - eightHours);
	fetchGuardianData();
	fetchNYTData();
	fetchBingData();

	setInterval( function() {
		// render the page once all processes are done
		if (GuardianDone && nytDone && BingDone) {
			// sort the array first!
			newsArray.sort(sortByDate);
			// do our callback work
			callback();
			// then stop the timer because Our Work Here Is Done
			clearInterval(this);
		}
	}, 1000);

}


// function to sort news items from newest to oldest date
function sortByDate(x,y){
	return (new Date(y.timeStamp) - new Date(x.timeStamp))
}

/*
 * Process data from The Guardian
 */
function fetchGuardianData() {
	var bUrl = "http://content.guardianapis.com/search";
	var parms = {
		'from-date': timeInterval.toISOString(),
		'order-by': 'oldest',
		'q': searchterm,
		'api-key': G_APIKEY
		};

	request ( {uri: bUrl, qs: parms} , function(error, guardianResponse, body) {
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

/*
 * Process data from New York Times
 */
function fetchNYTData() {
	// set my API request properties
	myBeginDate = getBeginDate();
	
	var baseUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json";
	var params = {
		'api-key': NYT_APIKEY,
		'q': searchterm,
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
	//console.log(myData);	
	var newsItems = myData.response.docs;
	console.log(newsItems.length + " NYT articles found")
	//console.log("nyt data:");
	//console.log(newsItems[0].abstract);
	for (var j = 0; j<newsItems.length; j++) {
		var myNews = newsItems[j];
		//console.log(myNews.abstract);
		// remove items outside our time window.
		var itemTimestamp = new Date(myNews.pub_date);
		if (itemTimestamp >= timeInterval) {
			var itemDate = itemTimestamp.toISOString().substring(0,10);
			var itemTime = itemTimestamp.toISOString().substring(11,16);
			var myItemInfo = { 
				'source': 'NYT',
				'webUrl': myNews.web_url, 
				'webTitle': myNews.headline.main,
				'timeStamp': itemTimestamp,
				'itemDate': itemDate,
				'itemTime': itemTime,
				'summary': myNews.abstract
				}
			//console.log('nyt summary:' + myItemInfo.summary);
			console.log(myItemInfo);
			newsArray.push(myItemInfo);
		}
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
	Bing.news(searchterm, {
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
	console.log(newsItems.length + " Bing articles found");
	for (var i=0; i<newsItems.length; i++) {
		var newsItem = newsItems[i];
		var headline = newsItem.Title;
		var itemUrl = newsItem.Url;
		// ignore news items that are datestamped earlier than our time window
		var itemTimestamp = newsItem.Date;
		if (itemTimestamp >= timeInterval.toISOString()) {
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
}
