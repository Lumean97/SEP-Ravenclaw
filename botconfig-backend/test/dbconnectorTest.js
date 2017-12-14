const assert = require('assert'); //node.js core module
const dbconnector = require('../modules/dbconnector');
const mongoClient = require('mongodb').MongoClient;
const mongoURL = 'mongodb://localhost:27017/mydb';


describe('DBConnector', function () {
    describe('#writeToDB', function () {
        it('should show the inserted bot inside the DB', function (done) {
            done();
            console.log("return now");
            return;
            mongoClient.connect(mongoURL, function (err, db) {
                if (err) throw err;
                //Inputparameter for data and for the searchrequest
                var requestToDB = {name: 'Fußfetischist'}

                //Make a create bot Request
                dbconnector.writeToDB(requestToDB).then(res => {

                    let botId = res._id;

                    //To get the inserted bot right off the database and save it in result
                    db.collection('botAgents').findOne(botId, function (err, result) {
                        if (err) console.log('The inserted Bot can not be found or could not be inserted!')
                        console.log(result)

                        //Save the _id which got generated by the database
                        requestToDB._id = result._id;

                        //Check if the bot which got inserted by the connector is in the database
                        assert.deepEqual(result, requestToDB);
                        //And then delete the bot from the database
                        /*
                        db.collection('botAgents').deleteOne(searchParameterForDB, function (err, obj) {
                            if (err) console.log('Fußfetishist could not be deleted!');
                        })
                        */
                        done();
                    });
                }).then(() => {
                    //Container for the IntendId
                    var intendId;
                    requestToDB.intent

                    //Write a bot to the Database
                    dbconnector.writeToDB(requestToDB).then(res => {

                        //Get the id-Parameter for the inserted bot
                        db.collection('botAgents').findOne(requestToDB, function (err, result) {

                            //Save the _id from the inserted bot
                            requestToDB._id = result._id;

                            //Build the Request-JSON to put
                            intendIdParam = result.intendId;
                            requestToDB = {
                                data: {
                                    name: 'Password',
                                    antwort: 'Soll ich dir dein Passwort vorkauen oder was?'
                                }
                            }

                            //The Request to put the intend to the bot
                            dbconnector.writeToDB(requestToDB).then(res => {

                                db.collection('botAgents').findOne(requestToDB, function (err, result) {

                                    //Save the intendID from the inserted bot
                                    requestToDB.intendId = result.intendId;

                                    //Look if the bot have the Intend correctly saved
                                    assert.deepEqual(result, requestToDB);

                                    //After that, delete the bot
                                    db.collection('botAgents').deleteOne(requestToDB, function (err, obj) {
                                        if (err) console.log('Bot with new Intend can not be deleted!');
                                    })
                                })
                                db.close();
                                done();
                            })
                        })
                    })
                });
            })
        })
    })

    describe('#writeConfig', function () {
        let bot = {
            id: "very special",
            config: null
        };
        before(function (done) {
            mongoClient.connect(mongoURL, function (err, db) {
                db.collection('botAgents').insertOne(bot, function (err, res) {
                    if (err) done(err);
                    bot.config = "Hallo Welt";
                    done();
                })
            });
        });
        it('should write the config to the db', (done) => {

            dbconnector.writeConfig(bot.config, bot.id).then(res => {
                mongoClient.connect(mongoURL, function (err, db) {
                    db.collection('botAgents').findOne({id: bot.id}, function (err, res) {
                        console.log(res);
                        assert.deepEqual(res.config, bot.config);
                        clean({id:bot.id});
                        done();
                    });
                });
            })
        })

    });

    describe('#setPrivacy', function () {
        let bot = {
            id: "very special privacy",
            privacy: "public"
        };
        before(function (done) {
            mongoClient.connect(mongoURL, function (err, db) {
                db.collection('botAgents').insertOne(bot, function (err, res) {
                    if (err) done(err);
                    bot.privacy = "private";
                    done();
                })
            });
        });
        it('should write the config to the db', (done) => {
            console.log(bot.privacy);
            dbconnector.setPrivacy(bot.id, bot.privacy).then(res => {
                mongoClient.connect(mongoURL, function (err, db) {
                    db.collection('botAgents').findOne({id: bot.id}, function (err, res) {
                        console.log(res);
                        console.log(bot);
                        assert.equal(res.privacy, bot.privacy);
                        clean({id:bot.id});
                        done();
                    });
                });
            })
        })

    });

});

function clean(payload){
    mongoClient.connect(mongoURL, function (err, db) {
        db.collection('botAgents').deleteOne(payload);
    })
}

