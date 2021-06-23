const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');

module.exports.getAll = function () {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('users')
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
                    .collection('users')
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
                    .collection('users')
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
                    .collection('users')
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
                    .collection('users')
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
