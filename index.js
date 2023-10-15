const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Require the 'path' module
const bodyParser = require('body-parser');
const cors = require('cors');

require("dotenv").config();
const Lecturer = require("./database/models/Lecturer");

const app = express();

// Connect to your MongoDB database
mongoose.connect(process.env.DB_CONNECT_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check if the connection to MongoDB was successful
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(5000, () => {
    console.log("zut-sts-server running on port: 5000");
  });
});

// Use the 'express.static' middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors({}));

app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('authentication started (server-side)...');
  console.log(email, password);
  try {
      // Check if the user exists in the database
      const user = await Lecturer.findOne({ email, password });

      if (user) {
          // Successful login, render the dashboard view and pass the user ID
          console.log('Login Success: ', email);
          res.json({status: 'success', email,  userId: user._id });
      } else {
          // Invalid credentials, show an error message or redirect to a login page
          res.status(401).send('Invalid credentials');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
  }
});

app.post('/get-dashboard', async (req, res) => {
  const {email} = req.body;

  const user = await Lecturer.findOne({ email });


  if (user) {
    // Successful login, redirect to the dashboard page with user ID as a query parameter
    
    console.log('Redirect Success: ', email);
    res.redirect(`/dashboard?userId=${user._id}`);
  } else {
    // Invalid credentials, show an error message or redirect to a login page
    res.status(401).send('something went wrong');
  }

});

app.get('/dashboard', async (req, res) => {
  const userId = req.query.userId;

  try {
    // Assuming you have a Mongoose model called 'Lecturer' to represent users
    const user = await Lecturer.findById(userId);

    if (user) {
      // Render the 'dashboard' view and pass user information to it
      res.render('dashboard', { user });
    } else {
      // Handle the case where the user is not found
      res.status(404).send('User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingLecturer = await Lecturer.findOne({ email });
    if (existingLecturer) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create a new lecturer instance
    const newLecturer = new Lecturer({ name, email, password });

    // Save the lecturer to the database
    await newLecturer.save();

    // Respond with success and the created lecturer's ID
    res.status(201).json({ message: 'Lecturer created successfully', userId: newLecturer._id });
  } catch (error) {
    console.error('Something went wrong...', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});





