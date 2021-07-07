const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');
const {Status} = require('../models/user');

const isValidPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
}

router.post('/registration', (req, res, next) => {
    if (req.body.password === req.body.repeatPassword) {
        db
            .user.getByEmail(req.body.email)
            .then((results) => {
                if (results.length === 0) {
                    const data = {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        registrationDate: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString(),
                        status: Status.ACTIVE,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                    };
                    db
                        .add('users', data)
                        .then((result) => {
                            generateToken(result[0], res, next);
                        })
                        .catch((err) => {
                            next(err);
                        })
                } else {
                    const err = new Error('This user already exists!');
                    err.status = 400;
                    next(err);
                }
            })
            .catch((err) => {
                next(err);
            })
    } else {
        const err = new Error('Password and password confirmation do not match!');
        err.status = 400;
        next(err);
    }
})

router.post('/login', (req, res, next) => {
    db
        .user.getByEmail(req.body.email)
        .then((results) => {
            if (results.length === 0) {
                const err = new Error('Is not a valid username or password!');
                err.status = 400;
                next(err);
                return;
            }
            if (results[0].status === Status.BLOCKED) {
                const err = new Error('Your account is blocked!');
                err.status = 403;
                next(err);
                return;
            }

            if (isValidPassword(results[0], req.body.password)) {
                db.user.updateLastLoginDate(results[0]._id).catch((err) => {
                    console.error(err);
                });
                generateToken(results[0], res, next);
            } else {
                const err = new Error('Is not a valid username or password!');
                err.status = 400;
                next(err);
            }
        })
        .catch((err) => {
            next(err);
        })
})

const generateToken = ({email, firstName, lastName}, res, next) => {
    const data = {};
    data.login = email;
    data.token = uuidv4();
    db
        .token.delete(email)
        .then(() => {
            db
                .add('token', data)
                .then((results) => {
                    res.json({
                        token: results.token,
                        user: {firstName, lastName},
                    })
                })
                .catch((err) => {
                    next(err)
                })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = router;
