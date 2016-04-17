// this toggles the visibility and required status of the second date field.

var rdoBefore = document.getElementById("searchBefore");
var rdoAfter = document.getElementById("searchAfter");
var rdoBetween = document.getElementById("searchBetween");
var rdoText = document.getElementById("text");
var calDate2 = document.getElementById("seconddate");
var searchText = document.getElementById("searchString");

rdoBefore.addEventListener("click",function(){ hideFields(); });
rdoAfter.addEventListener("click",function(){ hideFields(); });
rdoBetween.addEventListener("click",function(){ showFields(); });
rdoText.addEventListener("click",function(){ turnOffDates(); });

function hideFields(){
	calDate2.required=false;
	document.getElementById("secondDate").style.display="none";
	searchText.required=false;
}

function showFields(){
	document.getElementById("secondDate").style.display="inline";
	calDate2.required=true;
	searchText.required=false;
}

function turnOffDates(){
	hideFields();
	document.getElementById("firstdate").required=false;
	searchText.required=true;
	
}
