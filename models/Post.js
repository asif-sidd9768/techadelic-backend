const mongoose = require("mongoose")
const Schema = mongoose.Schema

const commentSchema = new Schema({
  commentUser: { type: String, required: true },
  postUser: {type: String},
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  commentImage: String,
  replies: [this],
});

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
  video: String,
  comments: [commentSchema]
}, { timestamps: true })

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Post", postSchema)