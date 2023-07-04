const mongoose = require("mongoose")
const Schema = mongoose.Schema

const storySchema = new Schema({
  userId: {type: String },
  userImage: String,
  content: { type: String, required: true },
  viewers: [{ 
    userId: { type: String },
    username: { type: String}
  }],
  createdAt: { type: Date, default: Date.now },
});

storySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model("Story", storySchema)