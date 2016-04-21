// repurposed from ToDo List lab.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');  // lets me hash user passwords
var NewsItem = require('./newsitems.js');
var ObjectID = Schema.ObjectId;

// my user schema
var userSchema = new Schema({
	fullname: String,  // friendly name, eg "bob"
	local : {
		username: {
			type: String,
			required: true,
			unique: true
		},
		password: String
	},
	signUpDate : { 
		type: Date,
		default: Date.now() 
	},

	favorites: [NewsItem.schema] // an array of the user's favorite news items
});

// copypasta from favecolors exercise in class
// these hash & unhash a user's password.
userSchema.methods.generateHash = function(password) {
	// create salted hash of pwd by hashing plaintext
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.validPassword = function(password) {
	// hash entered pwd, compare with stored hash
	return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);