const express = require('express');
const { randomBytes } = require('crypto')
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = new express();

app.use(cors());

app.use(bodyParser.json());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res, next) => {
    res.send(commentsByPostId[req.params.id]);
});

app.post('/posts/:id/comments', async (req, res, next) => {
    const commentId = randomBytes(4).toString('hex');

    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({
        id: commentId,
        content,
        status: 'PENDING'
    });

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'COMMENT_CREATED',
        data: {
            id: commentId,
            postId: req.params.id,
            content,
            status: 'PENDING'
        }
    });

    commentsByPostId[req.params.id] = comments;
    res.status(201).send(comments);
});

app.post('/events', async (req, res, next) => {
    const { type, data } = req.body;
    if (type === 'COMMENT_MODERATED') {
        const { id, postId } = data;

        const moderatedComment = commentsByPostId[postId].find(comment => comment.id === id);
        moderatedComment.status = data.status;
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'COMMENT_UPDATED',
            data: {...moderatedComment, postId}
        });
    }
    res.send({})
});

app.listen(4001, () => {
    console.log('Listening at port 4001 v1');
});