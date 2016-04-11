// required modules
var express = require('express');
var request = require('request');
var router = express.Router();
var mongoose = require('mongoose');

// database connection
var db = mongoose.connect('mongodb://localhost:27017/transnews');

// data model for news items
var NewsItems = require('../models/newsitems.js');

var curDateStamp;
	var twentyfourHours;
	var twentyfourHoursAgo;
var myTitle = "Transgender News Pulse";

/* GET home page. */
router.get('/', function(req, res, next) {
	newsArray = [];  // clear the array before fetching data
	curDateStamp = new Date();
	twentyfourHours = 24*60*60*1000;
	threeDaysAgo = new Date(curDateStamp - (3 * twentyfourHours) );
	threeDaysAgo = threeDaysAgo.toISOString();

	// extract data from database - find past 3 days' worth and sort descending
	NewsItems.find({timeStamp:{$gt:threeDaysAgo}}).sort({timeStamp : 'desc'}).exec( function(err,newsArray){
		if (err) console.log(err);
		//console.log(JSON.stringify(newsArray));
		res.render('index',{ title: myTitle, headlines: newsArray })
	});
});

/* GET about page */
router.get('/about',function(req,res,next){
	res.render('about', { title: myTitle});
});


// function to sort news items from newest to oldest date
function sortByDate(x,y){
	return (new Date(y.timeStamp) - new Date(x.timeStamp))
}


module.exports = router;
