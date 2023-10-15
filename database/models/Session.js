const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    year_of_study: String,
    programme_of_study: String,
    time_and_date: Date,
    notes_or_comments: String,
    attendees: [String], // Change the type to String
    lecturer_id: String,
  });
  

const Session = mongoose.model('Session', SessionSchema);

module.exports = Session;
