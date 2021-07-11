const {MongoClient} = require('mongodb');
const {dbName, url} = require('./dbConfig');
const RATING_COLLECTION = 'ratings';
module.exports.RATING_COLLECTION = RATING_COLLECTION;


module.exports.insertOrUpdate = function (userId, fanficId, rating) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection('ratings')
                    .updateOne({
                        fanficId, userId
                    }, {
                        $set: {rating, fanficId, userId}
                    }, {
                        upsert: true
                    }).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    reject(err)
                })
            })
    })
}
