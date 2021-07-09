const {MongoClient} = require('mongodb');
const {dbName, url} = require('./dbConfig');


const fanfic = require('./fanficDb');
module.exports.fanfic = fanfic;

const user = require('./userDb');
module.exports.user = user;

const token = require('./tokenDb');
module.exports.token = token;

const like = require('./likeDb');
module.exports.like = like;


module.exports.add = function (collection, data) {
    return new Promise((resolve, reject) => {
        MongoClient
            .connect(url, function (err, client) {
                if (err) {
                    reject(err);
                }
                client
                    .db(dbName)
                    .collection(collection)
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
