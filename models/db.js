const {MongoClient, ObjectId} = require('mongodb');
ObjectID = require('mongodb').ObjectID;
const url = "mongodb://localhost:27017/";
const dbName = 'task_4';

module.exports.getUsers = function () {
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

module.exports.deleteUsers = function (ids) {
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

module.exports.getUser = function (email) {
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

module.exports.getToken = function (token) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('token')
                    .find({"token": token})
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

module.exports.add = function (tabl, data) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(tabl)
                    .insertOne(data, function (err, results) {
                        if (err) {
                            reject(err);
                        }
                        client.close();
                        resolve(results.ops[0]);
                    })
            });
    })
}

module.exports.deleteTokens = function (email) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('token')
                    .deleteMany({email},
                        function (err, results) {
                            if (err) {
                                reject(err);
                            }
                            client.close();
                            resolve(results);
                        })
            });
    })
}
