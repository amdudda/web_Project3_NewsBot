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

/* POST a password change */
router.post('/changepassword', isLoggedIn, function(req,res,next){
	var oldpass = req.body.oldpassword;
	var newpass = req.body.newpassword;
	var confpass = req.body.confirmpassword;
	var myUserId = req.user._id;
	console.log("np: " + newpass + ", cp: " + confpass);
	// TODO - also verify they match on the client side before submitting the request.
	if (newpass == confpass) {
		// test the old password to verify it matches the one we have on file
		User.findById(myUserId,	function(err,user) {
			var isValidPwd = (user.validPassword(oldpass));
			// if error, something went REALLY wrong!  send user to login page
			if (err) {
				res.render('user',{title: myTitle, user: req.user, reseterr: err});
			}
			else if (!isValidPwd) {
				// if invalid password, go back and let user try again
				res.render('user',{title: myTitle, user: req.user, reseterr: 'Invalid password.  Please try again'});
			} else if (isValidPwd) {
			// TODO hash & save the new password
			// if successfully saved, render user with success message.
			}
		});
	}
});

module.exports = router;
