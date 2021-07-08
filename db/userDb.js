const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const USERS_COLLECTION = 'users';
module.exports.USERS_COLLECTION = USERS_COLLECTION;

module.exports.getAll = function () {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(USERS_COLLECTION)
                    .find({}, {password: 0})
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

module.exports.updateLastLoginDate = function (id) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(USERS_COLLECTION)
                    .updateOne({_id: id}, {
                        $currentDate: {
                            lastLoginDate: true,
                        }
                    })
            })
    })
}

module.exports.updateStatus = function (ids, status) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(USERS_COLLECTION)
                    .updateMany({
                        _id: {
                            $in: ids.map(id => {
                                return new ObjectId(id);
                            })
                        }
                    }, {
                        $set: {
                            status
                        }
                    }).then(() => {
                    resolve();
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
                    .collection(USERS_COLLECTION)
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
    })
}

module.exports.getByEmail = function (email) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(USERS_COLLECTION)
                    .find({email})
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
