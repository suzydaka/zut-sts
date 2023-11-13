const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Require the 'path' module
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();
const Lecturer = require("./database/models/Lecturer");
const Session = require("./database/models/Session");
const Student = require("./database/models/Student");

const app = express();
/*


7WlBA4rZxcIGzloNirLt2x3YKHVlmOXH
*/ 
const accountSid = "ACf54a417f057a989ad57c4798c82cbe49";
const authToken = "dd6eedd29899afc5b7cf6582113ff980";
const client = require("twilio")(accountSid, authToken);

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
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors({}));

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("authentication started (server-side)...");
  console.log(email, password);
  try {
    // Check if the user exists in the database
    const user = await Lecturer.findOne({ email, password });

    if (user) {
      // Successful login, render the dashboard view and pass the user ID
      console.log("Login Success: ", email);
      res.json({ status: "success", email, userId: user._id });
    } else {
      // Invalid credentials, show an error message or redirect to a login page
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/get-dashboard", async (req, res) => {
  const { email } = req.body;

  const user = await Lecturer.findOne({ email });

  if (user) {
    // Successful login, redirect to the dashboard page with user ID as a query parameter

    console.log("Redirect Success: ", email);
    res.redirect(`/dashboard?userId=${user._id}`);
  } else {
    // Invalid credentials, show an error message or redirect to a login page
    res.status(401).send("something went wrong");
  }
});

app.get("/dashboard", async (req, res) => {
  const userId = req.query.userId;

  try {
    // Assuming you have a Mongoose model called 'Lecturer' to represent users
    const user = await Lecturer.findById(userId);

    if (user) {
      // Render the 'dashboard' view and pass user information to it
      res.render("dashboard", { user });
    } else {
      // Handle the case where the user is not found
      res.status(404).send("User not found");
    }
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const existingLecturer = await Lecturer.findOne({ email });
    if (existingLecturer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new lecturer instance
    const newLecturer = new Lecturer({ name, email, password });

    // Save the lecturer to the database
    await newLecturer.save();

    // Respond with success and the created lecturer's ID
    res
      .status(201)
      .json({
        message: "Lecturer created successfully",
        userId: newLecturer._id,
      });
  } catch (error) {
    console.error("Something went wrong...", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/add-session", async (req, res) => {
  const { session } = req.body;

  console.log("saving lecture session (serverside): ", session);

  // Create a new Session instance
  const newSession = new Session({
    year_of_study: session.year_of_study,
    programme_of_study: session.programme_of_study,
    time_and_date: session.time_and_date,
    notes_or_comments: session.notes_or_comments,
    attendees: session.attendees,
    lecturer_id: session.lecturer_id, // Assign the lecturer ID
  });

  try {
    // Save the session to the database
    await newSession.save();

    // Respond with a success message
    res.status(201).json({ message: "Lecture session created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating lecture session" });
  }
});

// Define a POST route for '/register-student'
app.post("/register-student", upload.single("qrCode"), async (req, res) => {
  console.log("Student Registering: ", req.body);

  try {
    // Access form fields from req.body
    const studentId = req.body.studentId;
    const fullNames = req.body.fullNames;
    const yearOfStudy = req.body.yearOfStudy;
    const course = req.body.course;
    const programOfStudy = req.body.programOfStudy;

    // Access the uploaded image (qrCode) from req.file
    const qrCodeImageBuffer = req.file.buffer;

    // Create a new Student document
    const student = new Student({
      sid: studentId,
      fullname: fullNames,
      year_of_study: yearOfStudy,
      course: course,
      programme_of_study: programOfStudy,
      qr_code: qrCodeImageBuffer.toString("base64"), // Convert the image Buffer to base64
    });

    // Save the new Student document to the MongoDB collection
    await student.save();

    // Send a response indicating success
    res.status(200).json({ message: "Student registered successfully" });
  } catch (error) {
    // Handle any errors that may occur during processing
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/send-alert", (req, res) => {
  const { sid, fullname, programme_of_study, year_of_study } = req.body;

  // Format the message with line breaks for readability
  const message = `
  -----------------------
  ZUT - STS (ALERT SYSTEM)
  -----------------------
    Student ID: ${sid}
    Full Name: ${fullname}
    Programme of Study: ${programme_of_study}
    Year of Study: ${year_of_study}
    ATTENDANCE: 62%
    TUITION FEE: 40%
  -------------------------
  THIS ALERT SERVES TO INFORM YOU TO CHECK YOUR TUITION FEE AND ATTENDANCE`;

  console.log("Message body:", message);

  sendSMS("+260969314181");

  function sendSMS(phoneNumber) {
    // TWILIO SEND SMS
    client.messages
      .create({
        body: message,
        from: "+18173304801",
        to: phoneNumber,
      })
      .then((message) => {
        console.log(message.sid, "SMS Sent to:", phoneNumber);
        res.json({ message: "SMS Sent!" });
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
        res.json({ message: "SMS Failed!" });
      });
  }
});

app.post("/check-status", async (req, res) => {
  console.log("getting student Status: ", req.body);
  const { sid, lid } = req.body;
  let attendeesArray = [];
  let numOfSessions = 0;
  let totalSessions = 0;

  try {
    console.log('fetching session data');
    const sessionArray = await Session.find({ lecturer_id: lid });
    if (sessionArray) {
      totalSessions = sessionArray.length;
      for(let i = 0; i < sessionArray.length; i++){
        for(let j = 0; j < sessionArray[i].attendees.length; j++){
          attendeesArray.push(sessionArray[i].attendees[j]);
        }
        
      }
      
    }
  } catch (error) {
    console.log("Error: fetching data from Sessions");
  }

  try {
    const student = await Student.findOne({ sid: sid });

    

    if (student) {

      let attendancePercentage = 0;

      for(let i = 0; i < attendeesArray.length; i++){
        if(attendeesArray[i] == sid){
          numOfSessions++;
        }
      }

      attendancePercentage = (numOfSessions / totalSessions)  * 100;
      console.log("Attendance: ", attendancePercentage, '%');

      // console.log("User Data Fetched: ", student);
      res.status(200).json({student, attendancePercentage});
    } else {
      res.status(404).json({ message: "Student dosent Exist!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.post("/fetch-session", async (req, res) => {
  const { lecturerId } = req.body;
  console.log("fetching sessions: ", lecturerId);

  try {
    const sessions = await Session.find({ lecturer_id: lecturerId });

    if (sessions) {
      res.status(200).json({ sessions: sessions });
      console.log("Session Data Fetched!", sessions);
    }
  } catch (error) {
    res.status(401);
    console.log("Error Fetching Session Data: ", error);
  }
});
