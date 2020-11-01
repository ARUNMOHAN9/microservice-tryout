const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = new express();

app.use(cors());

app.use(bodyParser.json());


app.post('/events', async (req, res, next) => {
    const { type, data } = req.body;
    if (type === 'COMMENT_CREATED') {
        const { id, content, postId } = data;
        const status = content.toLowerCase().includes('orange') ? 'REJECTED' : 'APPROVED';

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'COMMENT_MODERATED',
            data: {
                id,
                postId,
                status,
                content
            }
        });
    }
    res.send({ status: 'ok' });
});

app.listen(4003, () => {
    console.log('Listening at port 4003');
});