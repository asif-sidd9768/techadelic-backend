const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Story = require("./Story")

// const storySchema = new Schema({
//   user: { type: Schema.Types.ObjectId, ref: "User" },
//   content: { type: String, required: true },
//   viewers: [{ 
//     userId: { type: String },
//     username: { type: String}
//   }],
//   createdAt: { type: Date, default: Date.now },
// });

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
  profileImg: String,
  story: {},
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