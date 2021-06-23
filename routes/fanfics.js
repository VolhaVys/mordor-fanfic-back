const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../helpers/authHelper');


router.get('/fanfics', (req, res, next) => {
    db
        .user.getAll()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
})
