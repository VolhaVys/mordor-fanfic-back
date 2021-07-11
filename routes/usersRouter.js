const express = require('express');
const router = express.Router();
const db = require('../db/db');
const {Status} = require('../models/user');
const { auth } = require('../helpers/authHelper');


const setUserStatus = (req, res, next, status) => {
  db
      .user.updateStatus(req.body, status)
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
      .user.getAll()
      .then((results) => {
        res.json(results);
      })
      .catch((err) => {
        next(err);
      })
}

router.get('/users', auth, (req, res, next) => {
  getUsers(res, next);
})

router.put('/users/block', auth, (req, res, next) => {
  setUserStatus(req, res, next, Status.BLOCKED);
})

router.put('/users/unblock', auth, (req, res, next) => {
  setUserStatus(req, res, next, Status.ACTIVE);
})

router.delete('/users', auth, (req, res, next) => {
  db
      .user.delete(req.body)
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

module.exports = router;
