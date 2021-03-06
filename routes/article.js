/* This route handles adding and removing favorite articles for a user */

// required modules
var express = require('express');
var request = require('request');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');

// data model for news items & user
var NewsItems = require('../models/newsitems.js');
var User = require('../models/user.js');

//var ObjectId = mongoose.Types.ObjectId

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

/* work with route parameters to provide task objects */
router.param("article_id", function(req, res, next, articleId) {

    console.log("params being extracted from URL for " + articleId);
	
    NewsItems.findById(articleId, function(err,article) {
        if (err) {
            //res.render("favorites", { msg: "unable to find article", "error": error});
			console.log("error finding article by id:" + err);
			// set response to 304 "not modified" or 500/something and unable to find the article
			res.status(500).send("Database error: unable to find article.")
        }
        req.article = article;
        return next();
    });
});

/* THIS HANDLES ADDING FAVORITES */
router.get('/add/:article_id',isLoggedIn, function(req,res,next){
	console.log(req.user._id);
	var newsitem = req.article;
	// add article to user's favorites
	User.findById( req.user._id ,function(err,user) {
		// send success/failure response.
		if (err) {
			console.log("unable to find user");  // err 500 database problem
			//res.status(500).send("database error: unable to find user");
			//presumably user not logged in, redirect to login page
			req.logout();  // force user logout if possible
			res.redirect('/login');  // then send user back to login page.
		} else {
			user.favorites.addToSet(newsitem); // push the article - add to set prevents duplicates
			// save the updated data
			user.save(function(err){
				if (err) {
					if (err.code == 16837) {
						// set response to 304 not modified - this error happens if what was added was already in the array
						res.status(304).send("duplicate record");
					} else {
						console.log("error [" + err.code + "] saving favorite: " + err);  
						// set response to 500 server error
						// we can just fix the star on the client side
						res.status(500).send("misc error on server");
					}
				} else {
				// otherwise, all a-OK and we redirect to favorites for now
					console.log("saved article");
					// send 201 created 
					res.status(201).send("saved article to favorites");
				}
			});
		}
	});
});

/* work with route parameters to provide task objects */
router.param("art_id", function(req, res, next, articleId) {

    console.log("params being extracted from URL for " + articleId);
	req.artid = articleId;
	return next();
});

/* THIS HANDLES REMOVING FAVORITES */
router.get('/remove/:art_id',isLoggedIn, function(req,res,next){
	console.log(req.user._id);
	//var newsitem = req.article;
	var artID = req.artid;
	// add article to user's favorites
	User.findById( req.user._id ,function(err,user) {
		// send success/failure response.
		if (err) {
			console.log("unable to find user");
			req.logout();  // force user logout if possible
			res.redirect('/login');  // then send user back to login page.
		} else {
			userfavs = user.favorites;
			//console.log(userfavs.length + " faves found");
			// find the favorite to remove it.  don't break out of loop in case there are duplicates.
			for (var i=0; i < user.favorites.length; i++){
				if (user.favorites[i]._id == artID) {
					user.favorites.splice(i,1);
					console.log("removing article from favorites");
				}
			}
			// save the user's data
			user.save(function(err){
				if (err) {
					console.log("error saving updated data");  
					// send err 500 database problem
					res.status(500).send("error saving updated data")
				}
				// otherwise, all a-OK and we redirect to favorites for now
				// send success 200 OK
				res.status(200).send("success");
			});
		}
	});
});

/* make the route available to the website */
module.exports = router;
