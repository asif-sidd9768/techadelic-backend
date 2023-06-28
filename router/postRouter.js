const postRouter = require('express').Router()
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Customize the filename to include the original file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${uniqueSuffix}.${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });
const { getAllPosts, createPost, likePostHandler, editPostHandler, deletePostHandler, dislikePostHandler, deletePostImg } = require("../controller/postController")
const { authenticateUser } = require('../middleware/authenticate')

postRouter.get("/", getAllPosts)
postRouter.post("/", authenticateUser, upload.single("postImage"), createPost)
postRouter.post("/like/:postId", authenticateUser, likePostHandler)
postRouter.post("/dislike/:postId", authenticateUser, dislikePostHandler)
postRouter.post("/edit/:postId", authenticateUser, upload.single("editedImage"), editPostHandler)
postRouter.delete("/:postId", authenticateUser, deletePostHandler)
postRouter.post('/test-del', deletePostImg)

module.exports = postRouter