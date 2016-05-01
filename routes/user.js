var express = require('express');
var router = express.Router();
var User = require('../models/user.js');

var myTitle = "Transgender News Pulse";
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

/* GET users listing. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.render('user', {title: myTitle, user: req.user});
});

/* POST a fullname change */
router.post('/changename', isLoggedIn, function(req,res,next){
	console.log("new name is: " + req.body.fullname);
	// try to change name and refresh page
	var myUser = User(req.user);
	myUser.fullname = req.body.fullname;
	myUser.save(function(err){
		if (err)
			res.render('user', {title: myTitle, user: req.user, nameerror: err});
		else
			res.redirect('/user');
	});
	
});

module.exports = router;
