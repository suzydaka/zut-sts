const mongoose = require('mongoose');

// Define a subdocument schema for lecture sessions
const SessionSchema = new mongoose.Schema({
  year_of_study: String,
  programme_of_study: String,
  time_and_date: Date,
  notes_or_comments: String,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

// Define the main schema for Lecturer
const LecturerSchema = new mongoose.Schema({
  email: String,
  password: String,
  lecture_sessions: [SessionSchema], // Embed the array of lecture sessions
});

// Create a model
const Lecturer = mongoose.model('Lecturer', LecturerSchema);

module.exports = Lecturer;
