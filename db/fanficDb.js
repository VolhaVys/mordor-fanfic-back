const {BOOKMARKS_COLLECTION} = require("./bookmarksDb");
const {LIKES_COLLECTION} = require("./likeDb");
const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const {USERS_COLLECTION} = require('./userDb');
const FANFICS_COLLECTION = 'fanfics';
module.exports.FANFICS_COLLECTION = FANFICS_COLLECTION;

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
                        [{
                            $match: {
                                $and: [{userId: new ObjectId(userId)}]
                            }
                        }, {
                            $lookup: {
                                from: USERS_COLLECTION,
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user'
                            }
                        }, {
                            $unwind: `$user`
                        }, {
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
                                isLiked: { $gt: [{$size: "$user_like"}, 0] }
                            }
                        }, {
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
                        }, {
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
                                isBookmarked: { $gt: [{$size: "$user_bookmark"}, 0] }
                            }
                        },{
                            $project: {
                                _id: 1,
                                fandom: 1,
                                tags: 1,
                                title: 1,
                                description: 1,
                                likes: 1,
                                isLiked: 1,
                                isBookmarked: 1,
                                user: {firstName: 1, lastName: 1, _id: 1}
                            }
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
                        [{
                            $match: {
                                $and: [{userId: new ObjectId(userId)}]
                            }
                        }, {
                            $lookup: {
                                from: USERS_COLLECTION,
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user'
                            }
                        }, {
                            $unwind: `$user`
                        }, {
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
                                isLiked: { $gt: [{$size: "$user_like"}, 0] }
                            }
                        }, {
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
                        }, {
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
                                isBookmarked: { $gt: [{$size: "$user_bookmark"}, 0] }
                            }
                        }, {
                            $match: {
                                $and: [{isBookmarked: true}]
                            }
                        }, {
                            $project: {
                                _id: 1,
                                fandom: 1,
                                tags: 1,
                                title: 1,
                                description: 1,
                                likes: 1,
                                isLiked: 1,
                                isBookmarked: 1,
                                user: {firstName: 1, lastName: 1, _id: 1}
                            }
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

module.exports.update = function (fanfic) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                let data = {...fanfic};
                delete data._id;

                client
                    .db(dbName)
                    .collection(FANFICS_COLLECTION)
                    .updateOne({
                        _id: new ObjectId(fanfic._id)
                    }, {
                        $set: data
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

                        if(results.length) {
                            resolve(results[0]);
                        }
                        // TODO write error
                        reject({});
                    })
            })
    })
}
