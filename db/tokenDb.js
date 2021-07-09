const {MongoClient} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const TOKENS_COLLECTION = 'tokens';
module.exports.TOKENS_COLLECTION = TOKENS_COLLECTION;


module.exports.get = function (token) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(TOKENS_COLLECTION)
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

module.exports.delete = function (email) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(TOKENS_COLLECTION)
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
