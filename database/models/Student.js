const mongoose = require('mongoose');

// Define a subdocument schema for lecture sessions
const StudentSchema = new mongoose.Schema({
  sid: String,
  fullname: String,
  year_of_study: String,
  programme_of_study: String,
  qr_code: String,
});


// Create a model
const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;
