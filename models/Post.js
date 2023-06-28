const mongoose = require("mongoose")
const Schema = mongoose.Schema

const postSchema = new Schema({
  content: {type: String, required: true},
  username: {type: String, required: true},
  likes: {
    likeCount: Number,
    likedBy: [],
    dislikedBy: [],
  },
  followers:[],
  following: [],
  bookmarks: [],
  image: String,
  video: String
}, { timestamps: true })

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Post", postSchema)