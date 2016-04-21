var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectID = Schema.ObjectId;

/*
 * a database to archive news items found by the search apis
 * the data will be retrieved by the web site so people can do archival searches
 */

var newsSchema = new Schema({
	'source': { // API the article was drawn from
		type: String,  // currently 'Guardian', 'Bing', or 'NYT'
		required: true
		},
	'webUrl': {  // uri of article
		type: String, 
		required: true,
		unique: true,  // might change this
		},
	'webTitle': {  // headline or title of article
		type: String,
		required: true
		},
	'timeStamp': {  // when article was published
		type: Date,
		required: true
		},
	'itemDate': String,  // extracted from timeStamp
	'itemTime': String,  // extracted from timeStamp
	'summary': String  // NYT abstract or Bing summary
});

module.exports = mongoose.model("NewsItem", newsSchema);
