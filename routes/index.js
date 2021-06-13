const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');

const status = {ACTIVE: 'active', BLOCKED: 'blocked'};

let auth = function (req, res, next) {
    db
        .getToken(req.headers.authorization)
        .then((results) => {
            if (results.length === 0) {
                const err = new Error('Не авторизован!');
                err.status = 401;
                next(err);
            } else {
                next()
            }
        })
        .catch((err) => {
            next(err);
        })
}

const isValidPassword = function (user, password) {
    return bcrypt.compareSync(password, user.password);
}

router.get('/', (req, res) => {
    res.json({
        message: 'Ping'
    })
});

router.get('/secret', auth, (req, res) => {
    res.json({
        message: 'Секретная страница!'
    })
});

router.post('/registration', (req, res, next) => {
    if (req.body.password === req.body.repeatPassword) {
        db
            .getUser(req.body.email)
            .then((results) => {
                if (results.length === 0) {
                    const data = {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        registrationDate: new Date().toISOString(),
                        lastLoginDate: new Date().toISOString(),
                        status: status.ACTIVE,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                    };
                    db
                        .add('users', data)
                        .then((result) => {
                            generateToken(req.body.email, res, next);
                        })
                        .catch((err) => {
                            next(err);
                        })
                } else {
                    const err = new Error('Такой пользователь уже есть!');
                    err.status = 400;
                    next(err);
                }
            })
            .catch((err) => {
                next(err);
            })
    } else {
        const err = new Error('Не совпадает пароль и подтверждение пароля!');
        err.status = 400;
        next(err);
    }
})

router.get('/user', auth, (req, res, next) => {
    db
        .getUsers()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
})

router.post('/login', (req, res, next) => {
    db
        .getUser(req.body.email)
        .then((results) => {
            if (results.length === 0) {
                const err = new Error('Не верный логин или пароль!');
                err.status = 400;
                next(err);
                return;
            }

            if (isValidPassword(results[0], req.body.password)) {
                db.updateLastLoginDate(results[0]._id).catch((err) => {
                    console.error(err);
                })
                generateToken(req.body.email, res, next);
            } else {
                const err = new Error('Не верный логин или пароль!');
                err.status = 400;
                next(err);
            }
        })
        .catch((err) => {
            next(err);
        })
})

const generateToken = (email, res, next) => {
    const data = {};
    data.login = email;
    data.token = uuidv4();
    db
        .delete(email)
        .then((results) => {
            db
                .add('token', data)
                .then((results) => {
                    res.json({
                        token: results.token
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
