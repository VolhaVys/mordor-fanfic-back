const {RATING_COLLECTION} = require("./ratingDb");
const {BOOKMARKS_COLLECTION} = require("./bookmarksDb");
const {LIKES_COLLECTION} = require("./likeDb");
const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const {USERS_COLLECTION} = require('./userDb');
const FANFICS_COLLECTION = 'fanfics';
module.exports.FANFICS_COLLECTION = FANFICS_COLLECTION;

const fanficPipeline = {
    addUser: () => [{
        $lookup: {
            from: USERS_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
        }
    }, {
        $unwind: `$user`
    }],
    isLiked: (userId) => [{
        $lookup: {
            from: LIKES_COLLECTION,
            let: {id: "$_id"},
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            {$eq: ['$fanficId', '$$id']},
                            {$eq: ['$userId', userId]},
                        ]
                    }
                }
            }],
            as: 'user_like'
        }
    }, {
        $addFields: {
            isLiked: {$gt: [{$size: "$user_like"}, 0]}
        }
    }],
    addLikesCount: () => [{
        $lookup: {
            from: LIKES_COLLECTION,
            localField: '_id',
            foreignField: 'fanficId',
            as: 'ff_likes'
        }
    }, {
        $addFields: {
            likes: {$size: "$ff_likes"}
        }
    }],
    isBookmarked: (userId) => [{
        $lookup: {
            from: BOOKMARKS_COLLECTION,
            let: {id: "$_id"},
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            {$eq: ['$fanficId', '$$id']},
                            {$eq: ['$userId', userId]},
                        ]
                    }
                }
            }],
            as: 'user_bookmark'
        }
    }, {
        $addFields: {
            isBookmarked: {$gt: [{$size: "$user_bookmark"}, 0]}
        }
    }],
    addRate: (userId) => [{
        $lookup: {
            from: RATING_COLLECTION,
            let: {id: "$_id"},
            pipeline: [{
                $match: {
                    $expr: {
                        $and: [
                            {$eq: ['$fanficId', '$$id']},
                            {$eq: ['$userId', userId]},
                        ]
                    }
                }
            }],
            as: 'user_rate'
        }
    }, {
        $addFields: {
            rate: {$ifNull: [{$first: '$user_rate.rating'}, null]}
        }
    }],
    addRating: () => [{
        $lookup: {
            from: RATING_COLLECTION,
            localField: '_id',
            foreignField: 'fanficId',
            as: 'ff_rating'
        }
    }, {
        $addFields: {
            rating: {$avg: "$ff_rating.rating"}
        }
    }],
    allFields: () => [{
        $project: {
            _id: 1,
            fandom: 1,
            tags: 1,
            title: 1,
            description: 1,
            likes: 1,
            isLiked: 1,
            isBookmarked: 1,
            rate: 1,
            rating: 1,
            user: {firstName: 1, lastName: 1, _id: 1},
            updateAt: 1
        }
    }],
    noAuthFields: () => [{
        $project: {
            _id: 1,
            fandom: 1,
            tags: 1,
            title: 1,
            description: 1,
            likes: 1,
            rating: 1,
            user: {firstName: 1, lastName: 1, _id: 1},
            updateAt: 1
        }
    }]
}

module.exports.getAll = function () {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .find()
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    })
            })
    })
}

module.exports.getByUserId = function (userId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [].concat(
                            {
                                $match: {
                                    $and: [{userId: new ObjectId(userId)}]
                                }
                            },
                            fanficPipeline.addUser(),
                            fanficPipeline.isLiked(userId),
                            fanficPipeline.addLikesCount(),
                            fanficPipeline.isBookmarked(userId),
                            fanficPipeline.addRate(userId),
                            fanficPipeline.addRating(),
                            fanficPipeline.allFields()
                        )
                    )
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    });
            });
    });
}

module.exports.getTopRate = function (limit, userId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [].concat(
                            fanficPipeline.addRating(),
                            [{
                                $sort: {
                                    rating: -1
                                }
                            }, {
                                $limit: limit
                            }],
                            fanficPipeline.addUser(),
                            userId ? fanficPipeline.isLiked(userId) : [],
                            fanficPipeline.addLikesCount(),
                            userId ? fanficPipeline.isBookmarked(userId) : [],
                            userId ? fanficPipeline.addRate(userId) : [],
                            userId ? fanficPipeline.allFields() : fanficPipeline.noAuthFields()
                        )
                    )
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    });
            });
    });
}

module.exports.getLast = function (limit, userId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [].concat(
                            [{
                                $sort: {
                                    updateAt: -1
                                }
                            }, {
                                $limit: limit
                            }],
                            fanficPipeline.addRating(),
                            fanficPipeline.addUser(),
                            userId ? fanficPipeline.isLiked(userId) : [],
                            fanficPipeline.addLikesCount(),
                            userId ? fanficPipeline.isBookmarked(userId) : [],
                            userId ? fanficPipeline.addRate(userId) : [],
                            userId ? fanficPipeline.allFields() : fanficPipeline.noAuthFields()
                        )
                    )
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    });
            });
    });
}

module.exports.tagCloud = function () {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [{
                            $unwind: '$tags'
                        }, {
                            $group: { _id: '$tags', count: { $sum: 1 }}
                        }]
                    )
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    });
            });
    });
}

module.exports.getBookmarked = function (userId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [].concat(
                            fanficPipeline.isBookmarked(userId),
                            {
                                $match: {
                                    $and: [{isBookmarked: true}]
                                }
                            },
                            fanficPipeline.addUser(),
                            fanficPipeline.isLiked(userId),
                            fanficPipeline.addLikesCount(),
                            fanficPipeline.addRate(userId),
                            fanficPipeline.addRating(),
                            fanficPipeline.allFields(),
                        )
                    )
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();
                        resolve(results);
                    });
            });
    });
}

module.exports.update = function (fanficId, data) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }

                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .updateOne({
                        _id: fanficId
                    }, {
                        $set: data,
                        $currentDate: {
                            updateAt: true,
                        }
                    }).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err)
                })
            })
    })
}

module.exports.delete = function (id) {
    return new Promise((resolve, reject) => {
            MongoClient
                .connect(url, function (err, client) {
                    if (err) {
                        reject(err);
                    }
                    client
                        .db(dbName)
                        .collection(FANFICS_COLLECTION)
                        .deleteMany({
                            _id: new ObjectId(id)
                        }).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err)
                    })
                })
        }
    )
}

module.exports.getById = function (id) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .find({_id: new ObjectId(id)})
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();

                        if (results.length) {
                            resolve(results[0]);
                        }

                        reject({message: 'fanfic not found by id'});
                    })
            })
    })
}

module.exports.getRating = function (id) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .aggregate(
                        [].concat(
                            {
                                $match: {
                                    $and: [{_id: id}]
                                }
                            },
                            fanficPipeline.addRating(),
                            {
                                $project: {
                                    rating: 1,
                                }
                            }
                        ))
                    .toArray(function (err, results) {
                        if (err) {
                            reject(err)
                        }
                        client.close();

                        if (results.length) {
                            resolve(results[0]);
                        }

                        reject({message: 'fanfic not found by id'});
                    });
            });
    });
}
