let MongoClient = require('mongodb').MongoClient;

let url = 'mongodb://141.19.145.166:27017/mydb';

/**
 * This method is for write a new bot or changing intents inside 
 * the Mongo Database
 * @param {*JSON-Object} request
 * @returns boolean if writing to the Database was sucessfull
 */
exports.writeToDB = function (request) {

    let retval = {
        "message": "",
        "success": true
    }

    return MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        //To create a new Bot
        db.createCollection("botAgents", function (err, res) {
            if (err) throw err;
        });

        //To create an complete new bot, if no botID is set
        if (request.botId === undefined) {
            db.collection("botAgents").insertOne(request.data, function (err, res) {
                if (err) {
                    console.log('Bot couldnt get inserted! Dont ask me why.');
                    throw err;
                }
                console.log('Bot sucessfull inserted!');
                return true;
            });
        }

        //If something has to get changed on a spezific bot with a bot ID
        else {
            db.collection("botAgents").findOne({id:request.botId}, function (err, res) {
                if (err) {
                    console.log('Bot with such a bot ID couldnt be found!');
                    return false;
                }
                if (request.intendId === undefined) {
                    db.collection("botAgents").deleteOne({id:request.botId}, function(err, res){
                        if(err){

                        }else{
                            db.collection("botAgents").insertOne(request.data, function (err, res) {
                                if (err) {
                                    console.log('Bot couldnt get inserted! Dont ask me why.');
                                    throw err;
                                }
                                console.log('Bot sucessfull inserted!');
                                return true;
                            });
                        }
                    });
                    return true;
                }
                else {
                    let intent = undefined;
                    for(let i = 0; i<res.intents.length; i++){
                        if(res.intents[i] === request.intentId){
                            intent = res.intents[i];
                            break;
                        }
                    }
                    if(intent !== undefined){
                        //TODO delte old intent and insert new
                        return true;
                    } else {
                      // Intent not found, return false.
                        return false;
                    }
                }
            });
        }
    });
}

/**
 * This method is for getting a whole bot or reading intents out of the 
 * Mongo Database
 */
exports.readFromDB = function (request) {

    return new Promise(function (resolve) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;

            if (request.botId === undefined) {
                return db.collection("botAgents").find({}).toArray(function (err, res) {
                    resolve(res);
                });

            }

            //If the bot ID is set and intents from a bot are wanted
            else {
                db.collection("botAgents").findOne({id:request.botId}, function (err, res) {
                    if (err) {
                        console.log('A bot with such an ID can not be found!');
                        //returns an empty JSON-Object
                        resolve({});
                    }

                    else {
                        //If only one bot is wanted
                        if (request.intendId === undefined) {
                            resolve(res);
                        }

                        else {
                            let intent = undefined;
                            for(let i = 0; i<res.intents.length; i++){
                                if(res.intents[i] === request.intentId){
                                    intent = res.intents[i];
                                    break;
                                }
                            }
                            if(intent !== undefined){
                                resolve({});
                            } else {
                                resolve(intent);
                            }
                        }
                    }
                });
            }
        });
    });
}

exports.deleteFromDB = function(request) {

    return MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        if(request.botId === undefined) {
            return false;
        }
        
        //Look for a bot with the specific botID
        else {
            return db.collection("botAgents").findOne({id:request.botId}, function (err, res) {
                if (err) {
                    console.log('A bot with such an ID can not be found!');
                    return false;
                }
                
                //If intents have to be deleted for an specific bot
                else {
                    if(request.intentId === undefined) {
                        db.collection("botAgents").deleteOne({id:request.botId});
                        console.log("done");
                        return true; //Gebe ich an dieser Stelle nicht den kompletten bot zurück???
                    }

                    else {
                        
                    }
                }
            });
        }
    });
}

exports.readMultipleFromDB = function (request) {
    let retval = [];
    for (let i = 0; i < request.length; i++) {
        let response = exports.readFromDB(request[i]);
        retval.push(response);
    }
    return retval;
}