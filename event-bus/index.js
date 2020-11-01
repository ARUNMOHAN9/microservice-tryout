const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = new express();

app.use(cors());

app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res, next) => {
    const event = req.body;

    events.push(event);

    console.log(event);

    axios.post('http://posts-srv:4000/events', event);
    axios.post('http://comments-clusterip-srv:4001/events', event);
    axios.post('http://query-clusterip-srv:4002/events', event);
    axios.post('http://moderation-clusterip-srv:4003/events', event);

    res.send({ status: 'OK' });
});

app.get('/events', (req, res, next) => {
    res.send(events);
});

app.listen(4005, () => {
    console.log('v1');
    console.log('Listening at port 4005');
});