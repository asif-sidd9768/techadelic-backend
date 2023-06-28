const mongoose = require("mongoose")
const Schema = mongoose.Schema

const eventSchema = new Schema({
  name: {type: String, required: true},
  image: {type: String, require: true},
  happeningOn: Date,
  location: String,
  attendees: []
}, { timestamps: true })

eventSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model("Event", eventSchema)