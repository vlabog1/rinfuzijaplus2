const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://vladabog:XmeLFn!P-8R2WzR@cluster0.mkffb.mongodb.net/rinfuzijaplus?retryWrites=true&w=majority')
          .then(client => {
             console.log('Connected to rinfuzijaplus Database!.');
             _db = client.db();
             callback();
          })
          .catch(err => {
             console.log(err);
             throw err
          })
}

const getDb = () => {
       if(_db) {
            return _db
       }
       throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;





