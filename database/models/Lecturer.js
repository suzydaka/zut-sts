const mongoose = require('mongoose');


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

