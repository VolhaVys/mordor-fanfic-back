const {MongoClient, ObjectId} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const BOOKMARKS_COLLECTION = 'bookmarks';
module.exports.BOOKMARKS_COLLECTION = BOOKMARKS_COLLECTION;

module.exports.delete = function (userId, fanficId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(BOOKMARKS_COLLECTION)
                    .deleteMany({userId, fanficId},
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

// TODO remove
module.exports.getByUserId = function (userId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(BOOKMARKS_COLLECTION)
                    .find({userId: new ObjectId(userId)})
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
