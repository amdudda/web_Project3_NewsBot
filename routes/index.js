// required modules
var express = require('express');
var request = require('request');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

// database connection
//var db = mongoose.connect('mongodb://localhost:27017/transnews');

// data model for news items
var NewsItems = require('../models/newsitems.js');
var User = require('../models/user.js');

var curDateStamp;
	var twentyfourHours;
	var twentyfourHoursAgo;
var myTitle = "Transgender News Pulse";

/* GET home page. */
router.get('/', function(req, res, next) {
	//console.log(req.user);
	newsArray = [];  // clear the array before fetching data
	curDateStamp = new Date();
	twentyfourHours = 24*60*60*1000;
	threeDaysAgo = new Date(curDateStamp - (3 * twentyfourHours) );
	threeDaysAgo = threeDaysAgo.toISOString();

	// extract data from database - find past 3 days' worth and sort descending
	NewsItems.find({timeStamp:{$gt:threeDaysAgo}}).sort({timeStamp : 'desc'}).exec( function(err,newsArray){
		if (err) console.log(err);
		//console.log(JSON.stringify(newsArray));
		res.render('index',{ title: myTitle, headlines: newsArray, user: req.user })
	});
});

/* GET about page */
router.get('/about',function(req,res,next){
	res.render('about', { title: myTitle});
});

/* GET search page */
router.get('/search',function(req,res,next){
	console.log(req.user)
	res.render('search', { title: myTitle, user: req.user});
});

/* GET login/signup page */
router.get('/login',function(req,res,next){
	res.render('login', { title: myTitle, message : req.flash('signupMessage') });
});

/* GET favorites page */
router.get('/favorites', isLoggedIn ,function(req,res,next){
	//console.log("loading favorites...");
	//console.log(JSON.stringify(req.user));
	var userFaves = req.user.favorites;
	res.render('favorites', { title: myTitle, headlines: userFaves, user: req.user});
});

/*
 * post SIGNUP - called when user cliks the signup button on form
 * calls passport.authenticate with args
 * -- what to do on success
 * -- what to do on failure
 * -- whether to display flash messages to user
 */
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/favorites',
	failureRedirect: '/login',
	failureFlash: true
}));

/* POST login - called when user clicks login button
 * similar to signup, except w/ local-login
 */
router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/favorites',
	failureRedirect: '/login',
	failureFlash: true
}));

/* GET logout */
router.get('/logout', function(req, res, next) {
	req.logout();  // passport middleware adds this to req.
	res.redirect('/');  // then send user back to homepage.
});

/* use GET to fetch and show Archive search results */
router.get('/searchArchive',function(req,res,next){
	console.log(req.query);
	var myQuery = req.query;
	var qText = myQuery.searchType;
	var qParams;
	var date1 = new Date(myQuery.firstdate);
	// convert search string to human-readable format:
	if (qText == "between") {
		console.log("fetching between");
		qText += " " + myQuery.firstdate + " and " + myQuery.seconddate;
		var date2 = new Date(myQuery.seconddate);
		date2.setDate(date2.getDate() + 1);  // users are going to expect results to include the ending date...
		qParams = { timeStamp: { $gte : date1, $lte : date2 } };
		console.log(qParams);
	} else if (qText == "before") {
		//console.log("be-foooooore! *golf club swings*")
		qText += " " + myQuery.firstdate;
		qParams = { timeStamp: { $lt : date1 } };
	} else if (qText == "after") {  // after
		console.log("after")
		qText += " " + myQuery.firstdate;
		qParams = { timeStamp: { $gt : date1 } };
	} else if (qText == "text") {
		console.log("text")
		qText = "Text search for '" + myQuery.searchString + "'";
		// parse out other form choices and create the query parameters.
		qParams = getTextSearchParams(myQuery);
		console.log(qParams);
	}

	// fetch data from mongoDB and send back t osearch page
	NewsItems.find(qParams).sort({timeStamp : 'desc'}).exec( function(err,newsArray){
		if (err) console.log(err);
		res.render('search', {title: myTitle, queryText: qText, headlines: newsArray});
	});

});

// a function that returns a query string for text-based searches
function getTextSearchParams(formData){
	var type = formData.find;
	console.log(type);
	var findIn = formData.fieldToSearch;
	var qString;
	var qParm = {};
	// this uses a unified index to search both text and headlines.
	// three types of searches - phrase, boolean OR, and pseudowildcard
	if (type == "exact") {
		qString=  "\"" + formData.searchString + "\"";  // trying to get it to pass '\"coffee shop\"' or whatever
		qParm = { $text: { $search : qString } };		
	} else if (type == "or") {
		qParm = { $text : { $search : formData.searchString } };
	} else if (type == "pattern") {
		// here we set up a regex search - this one works if I c/p result into Mongo...??
		// https://docs.mongodb.org/manual/reference/operator/query/regex/#regex-case-insensitive
		// this link gave me the hint for mongoose syntax: http://stackoverflow.com/questions/9824010/mongoose-js-find-user-by-username-like-value
		// https://docs.mongodb.org/manual/reference/operator/query/or/
		regex = new RegExp(formData.searchString,"i");
		qParm = { $or : [ {summary : regex}, {webTitle: regex} ]};
		
	} else {  // TODO we have invalid selection, return everything?
		qParm = {};
	}

	// append final curly braces
	//qParm +=  "}}";
	return qParm;
}

/*
 * Middleware function to verify user is logged in and authorized.
 * sends user back to homepage on failure.
 * redirect also cancels all route handling and just redirects to wherever specified.
 */
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} 
	res.redirect('/login');  // note lack of else - we want to be really sure the user goes somewhere if the if clause falls through.
}

module.exports = router;
