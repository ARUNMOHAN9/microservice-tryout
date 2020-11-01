const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = new express();

app.use(cors());

app.use(bodyParser.json());

const posts = {};

const handleEvents = (type, data) => {
    if (type === 'POST_CREATED') {
        const {id,title} = data;
        posts[id] = {
            id,
            title,
            comments: []
        };
    }
    if (type === 'COMMENT_CREATED') {
        const {id, content, postId, status} = data;
        posts[postId].comments.push({
            id,
            content,
            status
        });
    }
    if (type === 'COMMENT_UPDATED') {
        const {id, content, postId, status} = data;

        const comment = posts[postId].comments.find(comment => comment.id === id);
        comment.status = data.status;
    }
};

app.get('/posts', (req, res, next) => {
    res.send(posts);
});

app.post('/events', (req, res, next) => {
    const {type, data} = req.body;
    handleEvents(type, data);
    res.send({status: 'ok'});
});

app.listen(4002, async () => {

    try {
        const res = await axios.get('http://event-bus-srv:4005/events');

    for (let event of res.data) {
        const {type, data} = event;
        handleEvents(type, data);
    }

    console.log('Listening at port 4002');
    } catch (error) {
        console.log(error);
    }
});