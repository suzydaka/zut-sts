const express = require('express');


const app = express();

app.get('/', (req, res) => {
    console.log('GET request made: /');
    res.json({name: 'Kabalwe'});
});

app.listen(5000, console.log('zut-sts-server running on port: 5000'));