// this script handles hiding/showing article summaries.

var allSummaries = document.getElementsByClassName("articleSummary");

// iterate through each summary, find the preceding a tag, and add mouseover/mouseout
// listeners to it
for (var i=0; i<allSummaries.length; i++){
	var mySummary = allSummaries[i];
	var recID = mySummary.id.substring(2); 
	
	// get the corresponding a tag, which has an ID matching the record id
	var link = document.getElementById(recID);
	// add the event listeners to it
	// TODO for some reason, each new event listener supersedes/replaces all the ones before it.
	// why isn't it adding a new event listener with a new tag for each one?
	link.addEventListener("mouseover", function(){ 
		document.getElementById("as"+this.id).style.display = "block"; 
	} );
	link.addEventListener("mouseout", function(){ 
		document.getElementById("as"+this.id).style.display = "none"; 
	} );
}

/*
 * this is repurposed from my portfolio project to allow me to send ajax requests and handle
 * the responses I get back
 */

function AjaxRequest(){
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE
    if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
        for (var i=0; i<activexmodes.length; i++){
            try{
                return new ActiveXObject(activexmodes[i]);
            }
            catch(e){
                //suppress error
            }
        }
    }
    else if (window.XMLHttpRequest) // if Mozilla, Safari etc
        return new XMLHttpRequest();
    else
        return false;
}

// variables to represent the yellow and grey stars
var yellowStar = "http://localhost:3000/images/sm-yellow-star.jpg";
var greyStar = "http://localhost:3000/images/sm-gray-star.jpg";
var ajaxResp;

// grab the stars and add event listener that will eventually call an ajax request
var allStars = document.getElementsByClassName("star");

for (var s = 0; s<allStars.length; s++){
	var myStar = allStars[s];
	var starId = myStar.id;
	var baseUrl = "http://localhost:3000/article"

	myStar.addEventListener("click", function() {
		var artID = this.id.substring(4);
		var whichStar = "grey";  // determine which star has been clicked
		if (this.src == yellowStar) whichStar="yellow";
		alert("articleID: " + artID + "\nstar: " + whichStar);
		// TODO two logical paths - if yellow, want to remove, if grey, want to add
		if (this.src == yellowStar) {  // remove
			var myUrl = baseUrl + "/remove/" + artID
			updateFaves(reactToResponse(this)).open("GET", myUrl, true);  // ?per_page=100
			updateFaves.send(null);
		} else { // add
			var myUrl = baseUrl + "/add/" + artID
			updateFaves.open("GET", myUrl, true);  // ?per_page=100
			updateFaves.send(null);
		}
	});
}

// TODO figure out how to catch response and act on it
// function to send ajax request to remove a favorite - return the error code for handling
function updateFaves(callback) {
	var myUpdtReq = new AjaxRequest();
	myUpdtReq.onreadystatechange=function(){
	    if (myUpdtReq.readyState==4){
			if (myUpdtReq.status == 200) {
				callback;  // this lets me pass the response to a response handler
			} else if (myUpdtReq.status == 500) {
				alert("Unable to update favorites due to database error.");  // this lets me pass the response to a response handler
			}
		} else {
			alert("An error has occured making the request");
		}
	}
}

function reactToResponse(star){
	console.log("reacting to response");
	alert("still working with: " + star.src);
}
