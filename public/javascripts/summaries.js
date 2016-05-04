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
var yellowStar;
var greyStar;
var baseUrl;
var production = true;
if (production) {
	yellowStar = "https://transnewspulse.herokuapp.com/images/sm-yellow-star.jpg";
	greyStar = "https://transnewspulse.herokuapp.com/images/sm-gray-star.jpg";
	baseUrl = "https://transnewspulse.herokuapp.com/article";
}
else {
	yellowStar = "http://localhost:3000/images/sm-yellow-star.jpg";
	greyStar = "http://localhost:3000/images/sm-gray-star.jpg";
	baseUrl = "http://localhost:3000/article";
}

// grab the stars and add event listener that will eventually call an ajax request
var allStars = document.getElementsByClassName("star");

for (var s = 0; s<allStars.length; s++){
	var myStar = allStars[s];
	var starId = myStar.id;
	//var baseUrl = "http://localhost:3000/article";

	myStar.addEventListener("click", function() {
		var artID = this.id.substring(4);
		alert("src=" + this.src);
		var whichStar = "grey";  // determine which star has been clicked
		// if (this.src == yellowStar) whichStar="yellow";
		//alert("articleID: " + artID + "\nstar: " + whichStar);
		// two logical paths - if yellow, want to remove, if grey, want to add
		if (this.src == yellowStar) {  // remove
			console.log("removing");
			var myUrl = baseUrl + "/remove/" + artID;
			changeFave(this,myUrl);
		} else { // add
			console.log("adding");
			var myUrl = baseUrl + "/add/" + artID;
			changeFave(this,myUrl);
		}
	});
}

function changeFave(star,myUrl){
	// catch response and act on it
	// function to send ajax request to add/remove a favorite - return the error code for handling
	updateFaves = new AjaxRequest();
	updateFaves.onreadystatechange=function(){
		if (updateFaves.readyState==4){
			var myStatus = updateFaves.status;
			console.log("status: " + myStatus);
			if (myStatus == 200 || myStatus == 201 || myStatus == 304) {
				// these are 200 = removed, 201 = added, 304 = tried to add, duplicate found
				reactToResponse(star);  // this lets me pass the response to a response handler
			} else if (myStatus == 500) {
				alert("Unable to update favorites due to database error.");  // this lets me pass the response to a response handler
			} else {
				alert("Something broke, but I'm not sure what or why.  Try logout & re-login?");
			}
		} 
		/*  only need this when debugging		
		else {
			alert("An error has occured making the request");
		}  */
	}
	updateFaves.open("GET", myUrl, true);
	updateFaves.send(null);
}


function reactToResponse(star){
	//console.log("reacting to response");
	//console.log("working with: " + star.src);
	// switch the colors of the stars.
	if (star.src == yellowStar) { star.src = greyStar; }
	else { star.src = yellowStar; }
}
