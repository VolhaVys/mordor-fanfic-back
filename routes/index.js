const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const {v4: uuidv4} = require('uuid');

const Status = {ACTIVE: 'active', BLOCKED: 'blocked'};

const setUserStatus = (req, res, next, status) => {
    db
        .updateStatus(req.body, status)
        .then(() => {
            if (status === Status.BLOCKED && req.body.includes(req.user._id.toString())) {
                const err = new Error('Your account is blocked!');
                err.status = 403;
                next(err);
                return;
            }

            getUsers(res, next);
        })
        .catch((err) => {
            next(err);
        })
}

const getUsers = (res, next) => {
    db
        .getUsers()
        .then((results) => {
            res.json(results);
        })
        .catch((err) => {
            next(err);
        })
}

const auth = function (req, res, next) {
    db
        .getToken(req.headers.authorization)
        .then((results) => {
            if (results.length === 0) {
                const err = new Error('Not authorized!');
                err.status = 401;
                next(err);
            } else {
                db
                    .getUser(results[0].login)
                    .then((results) => {
                        if (results[0].status === Status.BLOCKED) {
                            const err = new Error('Your account is blocked!');
                            err.status = 403;
                            next(err);
                            return;
                        }

                        req.user = results[0];
                        next();
                    })
                    .catch((err) => {
                        next(err);
                    })
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
        message: 'Secret page!'
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
                        status: Status.ACTIVE,
                        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
                    };
                    db
                        .add('users', data)
                        .then((result) => {
                            console.log(result)
                            generateToken(result.email, res, next);
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

router.get('/user', auth, (req, res, next) => {
    getUsers(res, next);
})

router.put('/user/block', auth, (req, res, next) => {
    setUserStatus(req, res, next, Status.BLOCKED);
})

router.put('/user/unblock', auth, (req, res, next) => {
    setUserStatus(req, res, next, Status.ACTIVE);
})

router.post('/user', auth, (req, res, next) => {
    db
        .deleteUsers(req.body)
        .then(() => {
            if (req.body.includes(req.user._id.toString())) {
                const err = new Error('Your account is deleted!');
                err.status = 403;
                next(err);
                return;
            }
            getUsers(res, next);
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
                db.updateLastLoginDate(results[0]._id).catch((err) => {
                    console.error(err);
                })
                generateToken(req.body.email, res, next);
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

const generateToken = (email, res, next) => {
    const data = {};
    data.login = email;
    data.token = uuidv4();
    db
        .deleteTokens(email)
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
