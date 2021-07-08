const {MongoClient} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const LIKES_COLLECTION = 'likes';
module.exports.LIKES_COLLECTION = LIKES_COLLECTION;

module.exports.delete = function (userId, fanficId) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(LIKES_COLLECTION)
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
