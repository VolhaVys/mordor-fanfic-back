const express = require('express');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const cors = require('cors');
const app = express();
const API_VERSION = 'v1';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Add headers
app.use(cors());

app.use(`/api/${API_VERSION}/`, authRouter);
app.use(`/api/${API_VERSION}/`, userRouter);

app.use(function (req, res, next) {
    const err = new Error('Path not found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    })
})

module.exports = app;
