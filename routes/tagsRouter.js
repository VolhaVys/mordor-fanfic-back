const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/tags/cloud', (req, res, next) => {
    db
        .fanfic.tagCloud()
        .then((results) => {
            res.json(results.map((tag) => {
                return {value: tag._id, count: tag.count};
            }));
        })
        .catch((err) => {
            next(err);
        });
});

router.get('/tags', (req, res, next) => {
    db
        .fanfic.tagCloud()
        .then((results) => {
            res.json(results.map((tag) => {
                return tag._id;
            }));
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
