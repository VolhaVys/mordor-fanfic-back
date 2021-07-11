const {Status} = require('../models/user');
const db = require('../db/db');

const auth = function (req, res, next) {
    db
        .token.get(req.headers.authorization)
        .then((results) => {
            if (results.length === 0) {
                const err = new Error('Not authorized!');
                err.status = 401;
                next(err);
            } else {
                db
                    .user.getByEmail(results[0].email)
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

module.exports.auth = auth;

const getUser = function (req, res, next) {
    db
        .token.get(req.headers.authorization)
        .then((results) => {
            if (results.length === 0) {
                next();
            } else {
                db
                    .user.getByEmail(results[0].email)
                    .then((results) => {
                        if (results[0].status === Status.BLOCKED) {
                            next();
                            return;
                        }

                        req.user = results[0];
                        next();
                    })
                    .catch(() => {
                        next();
                    })
            }
        })
        .catch(() => {
            next();
        })
}

module.exports.getUser = getUser;
