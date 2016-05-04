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
	var pagedata = {title: myTitle, user: req.user};
	console.log("np: " + newpass + ", cp: " + confpass);
	// TODO - also verify they match on the client side before submitting the request.
	if (newpass == confpass) {
		
		// test the old password to verify it matches the one we have on file
		User.findById(myUserId,	function(err,user) {
			var isValidPwd = (user.validPassword(oldpass));
			// if error, something went REALLY wrong!  reload with error message
			if (err) {
				pagedata.resetstatus = "Error resetting password: " + err;
				res.render('user',pagedata);
			}
			else if (!isValidPwd) {
				// if invalid password, go back and let user try again
				pagedata.resetstatus = 'Invalid password.  Please try again';
				res.render('user',pagedata);
			} else if (isValidPwd) {
			// hash & save the new password
				var hashNewPwd = user.generateHash(newpass);
				user.local.password = hashNewPwd;
				user.save(function(err){
					if (err) {
						pagedata.resetstatus = "Error saving new password: " + err;
						res.render('user', pagedata);
					}
					else {
						// if successfully saved, render user with success message.
						pagedata.resetstatus = "Password sucessfully reset!";
						res.render('user', pagedata);
					}
				});
			}
		});
	} else {  // passwords don't match, complain to user
		pagedata.resetstatus = 'New and confirmation passwords did not match. Please try again.';
		res.render('user', pagedata);
	}
});

module.exports = router;
