const Event = require("../models/Event")
const User = require("../models/User")

const getAllEventsHandler = async (req, res) => {
  try{
    const events = await Event.find({})
    res.status(200).send(events)
  }catch(error){
    console.log(error)
    res.status(500).send(error)
  }
}

const addNewEventHandler = async (req, res) => {
  try {
    console.log(req.body)
    const event = new Event({...req.body})
    await event.save()
    res.send(event)
  }catch(error){
    console.log(error)
    res.send(error)
  }
}

const joinEventHandler = async (req, res) => {
  try {
    console.log(req.params)
    const {eventId, userId} = req.params
    const event = await Event.findById(eventId)
    const user = await User.findById(userId)

    user.eventsJoined = [...user.eventsJoined, event]
    event.attendees = [...event.attendees, {id: user.id, username: user.username}]
    
    await user.save()
    await event.save()

    res.send(user)
  }catch(error){
    console.log(error),
    res.status(500).send(error)
  }
}

module.exports = {
  addNewEventHandler,
  getAllEventsHandler,
  joinEventHandler
}