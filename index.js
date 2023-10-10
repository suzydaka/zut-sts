const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Require the 'path' module
const bodyParser = require('body-parser');

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


app.get('/', (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('authentication started (server-side)...');
    console.log(email, password);
    try {
      // Check if the user exists in the database
      const user = await Lecturer.findOne({ email, password });
  
      if (user) {
        // Successful login, redirect to the dashboard
        console.log('Login Success: ', email);
        res.json({id: user._id, status: 'success'});
      } else {
        // Invalid credentials, show an error message or redirect to a login page
        res.status(401).send('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

