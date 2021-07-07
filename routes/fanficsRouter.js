const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../helpers/authHelper');


router.get('/fanfics', (req, res, next) => {
    db
        .fanfic.getAll()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
})

router.put('/fanfics', auth, (req, res, next) => {
    db
        .fanfic.update(req.body)
        .then((result) => {
            res.status(200).send({message: "Updated"});
        })
        .catch((err) => {
            next(err);
        })
})

router.delete('/fanfics', auth, (req, res, next) => {
    db
        .fanfic.delete(req.body)
        .then(() => {
            res.status(200).send({message: "Deleted"})
        })
        .catch((err) => {
            next(err);
        })
})

router.post('/fanfics', auth, (req, res, next) => {
    db
        .add('fanfics', {...req.body, userId: req.user._id})
        .then((result) => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch((err) => {
            next(err);
        })
})

router.get('/users/:id/fanfics', (req, res, next) => {
    db
        .fanfic.getByUserId(req.params.id)
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
})

router.get('/users/fanfics', auth, (req, res, next) => {
    db
        .fanfic.getByUserId(req.user._id)
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
})

module.exports = router;
