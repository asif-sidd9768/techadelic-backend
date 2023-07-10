const cloudinary = require('cloudinary').v2
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Post = require("../models/Post")
const Story = require('../models/Story')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllUsersHandler = async (req, res) => {
  try {
    const users = await User.find({})
    return res.status(200).send(users)
  }catch(error){
    return res.status(500).send(error)
  }
}

const getUserHandler = async (req, res) => {
  try {
    const {username} = req.params
    console.log(username);
    const user = await User.findOne({username})
    console.log(user)
    return res.status(200).send(user)
  }catch(error){
    return res.status(500).send(error)
  }
}

const createUser = async (req, res) => {
  const { username, password, ...rest } = req.body

  const isUserExist = await User.findOne({username: username})
  console.log('username === ',username)
  if(isUserExist){
    return res.status(422).json({message:"User already exists"})
  }

  try{
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username, 
      ...rest,
      passwordHash,
      followers: [],
      following: [],
      bookmarks: [],
    })
    await user.save()
    const userToken = {
      username: user.username,
      id:user._id
    }
  
    const token = jwt.sign(userToken, process.env.SECRET, {expiresIn: "3 days"})
    res.status(200).send({token, user})
  }catch(error){
    res.status(500).json({message: error.message})
  }
}

const loginUser = async (req, res) => {
  const {username, password} = req.body

  console.log('here')
  try {
    const user = await User.findOne({username:username})
    const correctPwd = user === null ? false : await bcrypt.compare(password, user.passwordHash)
  
    if(!(user && correctPwd)){
      return res.status(404).json({
        message:"Invalid username or password."
      })
    }
  
    const userToken = {
      username: user.username,
      id:user._id
    }
  
    const token = jwt.sign(userToken, process.env.SECRET, {expiresIn: "3 days"})
    res.status(200).send({token, user})
  }catch(error){
    res.status(500).json({message: error.message})
  }
  
}

const checkToken = async (req, res) => {
  const {token} = req.body
  try {
    // const decoded = jwt.verify(token, process.env.SECRET)
    // console.log(decoded)
    res.send(req.user)
  }catch(error){
    res.send(error)
  }
}

const bookmarkPostHandler = async (req, res) => {
  const { postId } = req.params;
  console.log(postId)
  const user = await User.findById(req.user.id)
  const post = await Post.findById(postId);
  try {
    const isBookmarked = user.bookmarks.some(
      (currPost) => currPost.id === postId
    );
    if (isBookmarked) {
      return res.status(400).send({error: ["This Post is already bookmarked"]})
    }
    user.bookmarks.push(post);
    await user.save()
    return res.status(200).send({bookmarks:user.bookmarks})
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const followUserHandler = async (req, res) => {
  const { followUserId } = req.params;
  const followUser = await User.findById(followUserId).populate('followers following');
  try {
    const user = await User.findById(req.user.id).populate('followers following');
    if (user.id === followUser.id) {
      return res.status(404).send({error: "You can follow yourself"})
    }
    const isFollowing = user.following.some(
      (currUser) => currUser.id === followUser.id
    );
    if (isFollowing) {
      return res.status(400).send({error:"User Already following"})
    }
    user.following = [...user.following, {id:followUser.id, username: followUser.username}]
    followUser.followers = [...followUser.followers, {id: user.id, username: user.username}]
    await user.save()
    await followUser.save()
    return res.status(200).send({user, followUser})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

const unFollowUserHandler = async (req, res) => {
  const { followUserId } = req.params;
  const followUser = await User.findById(followUserId)
  try {
    const user = await User.findById(req.user.id)
    const isFollowing = user.following.some(
      (user) => user.id === followUser.id
    );

    if (!isFollowing) {
      return res.status(400).send({error: "User already not following"})
    }

    user.following = user.following.filter((user) => user.id !== followUser.id)
    followUser.followers = followUser.followers.filter((user) => user.id !== user.id)

    await user.save()
    await followUser.save()
    return res.status(200).send({user, followUser})
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

const updateUserProfileHandler = async (req ,res) => {
  const user = await User.findById(req.user.id)
  try {
    const { userData } = req.body;
    if (userData && userData.username && userData.username !== user.username) {
      return res.status(404).send({error: ["Username cannot be changed"]})
    }

    user.firstName = userData.firstName
    user.lastName = userData.lastName
    user.bio = userData.bio
    user.url = userData.url
    // user = { ...user, ...userData, updatedAt: formatDate() };
    // this.db.users.update({ _id: user._id }, user);
    await user.save()
    return res.status(200).send(user)
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const updateProfileImgHandler = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    console.log(req.user.username)
    // const uniqueIdentifier = `${req.user.username}_${Date.now()}`;
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `profile_images/${req.user.id}`, // Set a unique identifier for the image, e.g., using the user's ID
    });

    // Access the Cloudinary URL for the uploaded image
    const imageUrl = result.secure_url;
    // console.log(req.body)
    const user = await User.findById(req.user.id)
    user.profileImg = imageUrl
    // Update the user's profile image URL in the database or perform any necessary operations
    // res.json({ imageUrl });
    await user.save()
    res.status(200).send(user)
  }catch(error){
    console.log(error)
    res.status(500).send(error)
  }
}

const removeBookmarkPostHandler = async (req, res) => {
  const { postId } = req.params;
  try {
    const user = await User.findById(req.user.id)
    console.log(user.bookmarks)
    console.log(postId)
    user.bookmarks.some(
      (currPost) => console.log(currPost._id.toString())
    );
    const isBookmarked = user.bookmarks.some(
      (currPost) => currPost._id.toString() === postId
    );
    if (!isBookmarked) {
      return res.status(400).send({error: "Post not bookmarked yet"})
    }
    const filteredBookmarks = user.bookmarks.filter(
      (currPost) => currPost._id.toString() !== postId
    );
    user.bookmarks = filteredBookmarks
    // this.db.users.update(
    //   { _id: user._id },
    //   { ...user, updatedAt: formatDate() }
    // );
    await user.save()
    return res.status(200).send({bookmarks:user.bookmarks})
    // return new Response(200, {}, { bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).send(error)
  }
}

const userStoryPostHandler = async (req, res) => {
  try {
    console.log(req.body)
    const user = await User.findById(req.user.id)
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const stories = await Story.find({})
    console.log(stories, user.id)
    if(stories.find(({userId}) => userId === req.user.id)){
      return res.status(400).send({error: "Can't post multiple story."})
    }

    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `story_images/${req.user.id}`, // Set a unique identifier for the image, e.g., using the user's ID
    });

    // Access the Cloudinary URL for the uploaded image
    const imageUrl = result.secure_url;
    const story = new Story({
      userId: req.user.id,
      userImage: user.profileImg ?? null,
      content: imageUrl,
      createdAt: new Date()
    })
    user.story = {...story}
    await story.save()
    await user.save()
    return res.status(200).send(user)
  }catch(error){
    console.log(error)
    return res.status(500).send(error)
  }
}

const getAllStoriesHandler = async (req, res) => {
  try {
    const stories = await Story.find({}).sort({ createdAt: -1 })
    const user = await User.findById(req.user.id)
    // const filteredUser = user.following
    res.status(200).send(stories)
  }catch(error){
    return res.status(500).send(error)
  }
}

const storyViewHandler = async (req, res) => {
  try{
    console.log(req.params)
    const { userId, storyId } = req.params
    const user = await User.findById(userId)
    const story = await Story.findById(storyId)

    const userExists = story.viewers.some(vwrs => vwrs.userId === user.id);
    story.viewers = userExists ? story.viewers : [...story.viewers, {userId: user.id, username: user.username}]

    await story.save()
    return res.status(200).send(story)
  }catch(error){
    return res.status(500).send(error)
  }
}

module.exports = {
  getAllUsersHandler,
  getUserHandler,
  createUser,
  loginUser,
  checkToken,
  bookmarkPostHandler,
  followUserHandler,
  unFollowUserHandler,
  updateUserProfileHandler,
  updateProfileImgHandler,
  removeBookmarkPostHandler,
  userStoryPostHandler, 
  getAllStoriesHandler,
  storyViewHandler
}