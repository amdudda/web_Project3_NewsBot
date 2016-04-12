// this toggles the visibility and required status of the second date field.

var rdoBefore = document.getElementById("searchBefore");
var rdoAfter = document.getElementById("searchAfter");
var rdoBetween = document.getElementById("searchBetween");
var calDate2 = document.getElementById("seconddate");

rdoBefore.addEventListener("click",function(){ hideFields(); });
rdoAfter.addEventListener("click",function(){ hideFields(); });
rdoBetween.addEventListener("click",function(){ showFields(); });

function hideFields(){
	calDate2.required=false;
	document.getElementById("secondDate").style.display="none";
}

function showFields(){
	document.getElementById("secondDate").style.display="inline";
	calDate2.required=true;
}
