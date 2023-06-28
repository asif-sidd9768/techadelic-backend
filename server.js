require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const userRouter = require("./router/userRouter")
const postRouter = require("./router/postRouter")
const eventRouter = require("./router/eventRouter")
const app = express()

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('successfully connected to DB')
}).catch((error) => {
  console.log('failed to connect to db== ', error)
})

app.use(cors())
app.use(express.json())

app.use("/api/user", userRouter)
app.use("/api/posts", postRouter)
app.use("/api/events", eventRouter)

app.listen(process.env.PORT, () => {
  console.log(`listening... on ${process.env.PORT}`)
})