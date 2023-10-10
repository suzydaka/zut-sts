const express = require('express');
const path = require('path'); // Require the 'path' module

const app = express();

// Use the 'express.static' middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(5000, () => {
    console.log('zut-sts-server running on port: 5000');
});
