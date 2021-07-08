const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const {USERS_COLLECTION} = require('./userDb');


module.exports.getAll = function () {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('fanfics')
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

module.exports.getByUserId = function (id) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('fanfics')
                    .aggregate(
                        [{
                            $match: {
                                $and: [{userId: new ObjectId(id)}]
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
                            $project: {
                                _id: 1,
                                fandom: 1,
                                tags: 1,
                                chapters: 1,
                                title: 1,
                                description: 1,
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
                    .collection('fanfics')
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

module.exports.delete = function (ids) {
    return new Promise((resolve, reject) => {
            MongoClient
                .connect(url, function (err, client) {
                    if (err) {
                        reject(err);
                    }
                    client
                        .db(dbName)
                        .collection('fanfics')
                        .deleteMany({
                            _id: {
                                $in: ids.map(id => {
                                    return new ObjectId(id);
                                })
                            }
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
                    .collection('fanfics')
                    .find({_id: new ObjectId(id)})
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

module.exports.like = function (fanfic) {
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
                    .collection('fanfics')
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
