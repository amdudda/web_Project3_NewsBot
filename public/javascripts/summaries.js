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