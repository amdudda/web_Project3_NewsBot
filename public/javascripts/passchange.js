// this manages the submit button on user.jade

// this is the new pwd submission button
var submitButton = document.getElementById("SubmitPwd");
// and these are the textboxes I need to work with
var newpassBox = document.getElementById("newpassword");
var confpassBox = document.getElementById("confirmpassword");
console.log("i'm here!");
// this function evaluates the two boxes and determine whether they have the same text
function doPasswordsMatch(){
	//console.log(newpassBox.value == confpassBox.value);
	if (newpassBox.value == confpassBox.value) {
		submitButton.disabled=false;
	}
	else {
		submitButton.disabled=true;
	}
}

// add a keypress listener to each of the boxes I need to compare
// if there more than 2 fields, I'd convert this to a for loop.
newpassBox.addEventListener("keyup", function(){
	doPasswordsMatch();
});
confpassBox.addEventListener("keyup", function(){
	doPasswordsMatch();
});
