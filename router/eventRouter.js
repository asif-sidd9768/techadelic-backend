const { addNewEventHandler, getAllEventsHandler, joinEventHandler } = require("../controller/eventController")
const { authenticateUser } = require("../middleware/authenticate")

const eventRouter = require("express").Router()

eventRouter.get("/", getAllEventsHandler)
eventRouter.post("/add-new", addNewEventHandler)
eventRouter.post("/:eventId/join/:userId", authenticateUser, joinEventHandler)

module.exports = eventRouter