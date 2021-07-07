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
                    .find({userId: new ObjectId(id)}, {userId: 0})
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
