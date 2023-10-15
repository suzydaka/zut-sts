const mongoose = require('mongoose');

// Define a subdocument schema for lecture sessions
const SessionSchema = new mongoose.Schema({
  year_of_study: String,
  programme_of_study: String,
  time_and_date: Date,
  notes_or_comments: String,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const lecturerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Lecturer = mongoose.model('Lecturer', lecturerSchema);

module.exports = Lecturer;

