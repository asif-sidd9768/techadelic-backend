const cloudinary = require('cloudinary').v2
const Post = require("../models/Post")
const User = require("../models/User")
const { sortPost } = require("../utils/sortPost")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate the skip value based on the page and limit
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch posts from the database with pagination using Mongoose
    const posts = await Post.find({})
      .skip(skip)
      .limit(limitNumber);

    const sortedPosts = sortPost(posts);

    return res.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const file = req.file;
    const postData = req.body;

    const post = {
      ...postData,
      likes: {
        likeCount: 0,
        likedBy: [],
        dislikedBy: [],
      },
      username: req.user.username,
      userImage: user.profileImg
    };
    const createdPost = await Post.create(post);
    if(file && file.mimetype && file?.mimetype?.includes("image")){
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: `post_images/${createdPost.id}`, // Set a unique identifier for the image, e.g., using the user's ID
      });
      // Access the Cloudinary URL for the uploaded image
      const imageUrl = result.secure_url;
      createdPost.image = imageUrl
    }

    if(file && file.mimetype && file.mimetype.includes("video")){
      const result = await cloudinary.uploader.upload(file.path, 
      { resource_type: "video", 
        public_id: `post_videos/${createdPost.id}`,
        chunk_size: 6000000,
        eager: [
          { width: 300, height: 300, crop: "pad", audio_codec: "none" }, 
          { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" } ],                                   
        eager_async: true,
        eager_notification_url: "https://mysite.example.com/notify_endpoint" })
      // Access the Cloudinary URL for the uploaded image
      const imageUrl = result.secure_url;
      createdPost.video = imageUrl
    }

    const posts = await Post.find({})
    await createdPost.save()
    // console.log(createdPost)
    res.status(200).send(createdPost)
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

const likePostHandler = async (req, res) => {
  try {
    const {postId} = req.params;
    const post = await Post.findById(postId)
    if (post.likes.likedBy.some((currUser) => currUser.id === req.user.id)) {
      return res.status(400).send({error: ["Cannot like a post that is already liked."]})
    }
    post.likes.dislikedBy = post.likes.dislikedBy.filter(
      (currUser) => currUser.id !== req.user.id
    );
    post.likes.likeCount += 1;
    post.likes.likedBy = [...post.likes.likedBy, req.user]
    await post.save()
    const posts = await Post.find({})
    const sortedPost = sortPost(posts)
    return res.status(200).send(sortedPost)
  } catch (error) {
    res.status(500).send(error)
  }
}

const editPostHandler = async (req, res) => {
  const user = await User.findById(req.user.id)
  try {
    const file = req.file
    const postId = req.params.postId;
    const  postData  = req.body;
    const post = await Post.findById(postId);
    // console.log(post, user)
    if (post.username !== user.username) {
      return res.status(400).send({error: ["Cannot edit a post! it doesn't belong to you"]})
    }
    post.content = postData.content
    if(file){
      const result = await cloudinary.uploader.upload(file.path, {
        public_id: `post_images/${post.id}`, // Set a unique identifier for the image, e.g., using the user's ID
      });
      // Access the Cloudinary URL for the uploaded image
      const imageUrl = result.secure_url;
      post.image = imageUrl
    }
    await post.save()
    res.status(200).send(post)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const deletePostHandler = async (req, res) => {
  const user = await User.findById(req.user.id)
  try {
    const {postId} = req.params;
    const post = await Post.findById(postId)
    if (post.username !== user.username) {
      return res.status(400).send({error: ["Cannot delete a post doesn't belong to you"]})
    }
    if(post.image){
      await cloudinary.uploader.destroy(`post_images/${post?.id}`, function(error,result) {
        console.log(result, error) });
    }
    if(post.video) {
      await cloudinary.uploader.destroy(`post_videos/${post?.id}`, {resource_type: 'video'});
    }
    await Post.findByIdAndDelete(postId)
    return res.status(200).send(post)
  } catch (error) {
    return res.status(500).send(error)
  }
}

const dislikePostHandler = async  (req, res) => {
  const user = await User.findById(req.user.id)
  try {
    const {postId} = req.params;
    const post = await Post.findById(postId);
    if (post.likes.likeCount === 0) {
      return res.status(400).send({error:"Cannot decrement like less than 0."})
    }
    if (post.likes.dislikedBy.some((currUser) => currUser._id === user._id)) {
      return res.status(400).send({error: "Cannot Cannot dislike a post that is already disliked."})
    }
    post.likes.likeCount -= 1;
    const updatedLikedBy = post.likes.likedBy.filter(
      (currUser) => currUser.id !== user.id
    );
    post.likes.dislikedBy.push(user);
    post.likes = {...post.likes, likedBy: updatedLikedBy}
    // post = { ...post, likes: { ...post.likes, likedBy: updatedLikedBy } };
    await post.save()
    res.status(200).send(post)
    // return new Response(201, {}, { posts: this.db.posts });
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

const deletePostImg = async (req,res) => {
  try {
    await cloudinary.uploader.destroy('post_images/6499ca2feb30a24c9c09180c', function(error,result) {
      console.log(result, error) });
  }catch(error){
    return res.send(error)
    console.log(error)
  }
}

const createCommentHandler = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    const {commentData} = req.body
    console.log(commentData)
    post.comments = [...post.comments, {
      ...commentData,
      createAt: new Date(),
      postUser: post.username
    }]
    await post.save()
    return res.status(200).send(post)
  }catch(error){
    console.log(error)
    return res.status(500).send(error)
  }
}

module.exports = {
  getAllPosts,
  createPost,
  likePostHandler,
  editPostHandler,
  deletePostHandler,
  dislikePostHandler,
  deletePostImg,
  createCommentHandler
}