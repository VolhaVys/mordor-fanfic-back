const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { auth, getUser } = require('../helpers/authHelper');
const {RATING_COLLECTION} = require("../db/ratingDb");
const {BOOKMARKS_COLLECTION} = require("../db/bookmarksDb");
const {Role} = require("../models/user");
const {LIKES_COLLECTION} = require('../db/likeDb');
const {ObjectId} = require('mongodb');



const getFanfic = function (req, res, next) {
    db
        .fanfic.getById(req.params.id)
        .then((result) => {
            req.fanfic = result;
            next();
        })
        .catch((err) => {
            next(err);
        })
}

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

router.delete('/fanfics/:id', auth, getFanfic, (req, res, next) => {

    if (req.user._id.equals(req.fanfic.userId) || req.user.role === Role.ADMIN) {
        db
            .fanfic.delete(req.params.id)
            .then(() => {
                res.status(200).send({message: "Deleted"})
            })
            .catch((err) => {
                next(err);
            })
    } else {
        res.status(403).json({message: "No permission"});
    }
})

router.post('/fanfics', auth, (req, res, next) => {
    db
        .add('fanfics', {...req.body, userId: req.user._id, updateAt: new Date().toISOString(),})
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            next(err);
        })
})

router.get('/users/:id/fanfics', (req, res, next) => {
    db
        .fanfic.getByUserId(new ObjectId(req.params.id))
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

router.put('/fanfics/:id/like', auth, (req, res, next) => {
    db
        .like.insertOrUpdate(req.user._id, new ObjectId(req.params.id))
        .then((result) => {
            res.status(200).send({message: "Liked"});
        })
        .catch((err) => {
            next(err);
        })
})

router.put('/fanfics/:id/unlike', auth, (req, res, next) => {
    db
        .like.delete(req.user._id, new ObjectId(req.params.id))
        .then((result) => {
            res.status(200).send({message: "Unliked"});
        })
        .catch((err) => {
            next(err);
        })
})

router.put('/fanfics/:id/bookmark', auth,
    (req, res, next) => {
        db
            .add(BOOKMARKS_COLLECTION, {userId: req.user._id, fanficId: new ObjectId(req.params.id)})
            .then((result) => {
                res.status(200).send({message: "Bookmarked"});
            })
            .catch((err) => {
                next(err);
            })
    })

router.put('/fanfics/:id/remove_bookmark', auth, (req, res, next) => {
    db
        .bookmark.delete(req.user._id, new ObjectId(req.params.id))
        .then((result) => {
            res.status(200).send({message: "Bookmark removed"});
        })
        .catch((err) => {
            next(err);
        })
})

router.get('/fanfics/bookmarked', auth,
    (req, res, next) => {
        db
            .fanfic.getBookmarked(req.user._id)
            .then((results) => {
                res.json(results);
            })
            .catch((err) => {
                next(err);
            });
    })


router.put('/fanfics/:id/rating', auth, (req, res, next) => {
    const fanficId = new ObjectId(req.params.id);
    db
        .rating.insertOrUpdate(  req.user._id, fanficId, req.body.rating)
        .then((result) => {
            db.fanfic.getRating(fanficId)
                .then((results) => {
                    res.json(results);
                })
                .catch((err) => {
                next(err);
            });
        })
        .catch((err) => {
            next(err);
        })
})

router.get('/fanfics/top/:limit', getUser,
    (req, res, next) => {
        db
            .fanfic.getTopRate(+req.params.limit, req.user?._id)
            .then((results) => {
                res.json(results);
            })
            .catch((err) => {
                next(err);
            });
    })

router.get('/fanfics/last/:limit', getUser,
    (req, res, next) => {
        db
            .fanfic.getLast(+req.params.limit, req.user?._id)
            .then((results) => {
                res.json(results);
            })
            .catch((err) => {
                next(err);
            });
    })


module.exports = router;
