const express = require('express');
const { randomBytes } = require('crypto')
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = new express();

app.use(cors());

app.use(bodyParser.json());

const posts = {};

app.get('/posts', (req, res, next) => {
    res.send(posts);
});

app.post('/posts/create', async (req, res, next) => {
    const id = randomBytes(4).toString('hex');

    const { title } = req.body;

    posts[id] = {
        id,
        title
    };

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'POST_CREATED',
        data: {
            id,
            title
        }
    });

    res.status(201).send(posts[id]);
});

app.post('/events', (req, res, next) => {
    res.send({})
});

app.listen(4000, () => {
    console.log('v1.0.6');
    console.log('Listening at port 4000');
});