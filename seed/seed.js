require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const POSTS_DATA = require("./db")
const Post = require("../models/Post")
const app = express()

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('successfully connected to DB')
}).catch((error) => {
  console.log('failed to connect to db== ', error)
})

const addProductsToDB = async () => {
  POSTS_DATA.map(async postData => {
    const post = new Post({
      username: postData.username,
      ...postData
    })
    await post.save()
    console.log(post)
  })
}

addProductsToDB()