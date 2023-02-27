const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		min: [3, 'username must be 3 or more characters']
	},
	name: String,
	passwordHash: {
		type: String,
		required: true
	},
	blogs: [
		{
			type:  mongoose.Schema.Types.ObjectId,
			ref: 'Blog'
		}
	],
})

userSchema.plugin(uniqueValidator)
userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
		// the passwordHash should not be revealed
		delete returnedObject.passwordHash
	}
})

const User = module.exports = mongoose.model('User', userSchema)

module.exports = User