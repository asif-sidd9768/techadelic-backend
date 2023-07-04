const userRouter = require("express").Router()
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
const { createUser, loginUser, checkToken, bookmarkPostHandler, followUserHandler, getAllUsersHandler, unFollowUserHandler, updateUserProfileHandler, updateProfileImgHandler, removeBookmarkPostHandler, userStoryPostHandler, getAllStoriesHandler, storyViewHandler } = require("../controller/userController")
const { authenticateUser } = require("../middleware/authenticate")

userRouter.route("/all").get(getAllUsersHandler)
userRouter.route("/register").post(createUser)
userRouter.route("/login").post(loginUser)
userRouter.get("/stories", authenticateUser, getAllStoriesHandler)
userRouter.post("/token-check", authenticateUser, checkToken)
userRouter.post("/bookmark/:postId", authenticateUser, bookmarkPostHandler)
userRouter.post("/remove-bookmark/:postId", authenticateUser, removeBookmarkPostHandler)
userRouter.post("/follow/:followUserId", authenticateUser, followUserHandler)
userRouter.post("/unfollow/:followUserId", authenticateUser, unFollowUserHandler)
userRouter.post("/edit", authenticateUser, updateUserProfileHandler)
userRouter.post('/edit/profile', authenticateUser, upload.single("profileImage"), updateProfileImgHandler)
userRouter.post("/:userId/story", authenticateUser, upload.single("storyImage"), userStoryPostHandler)
userRouter.post("/:userId/story/:storyId", authenticateUser, storyViewHandler)
module.exports = userRouter