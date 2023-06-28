const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, required: true},
  passwordHash: {type: String, required: true},
  eventsJoined: [],
  followers:[],
  following: [],
  bookmarks: [],
  bio: String,
  url: String,
  profileImg: String
}, { timestamps: true })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model("User", userSchema)