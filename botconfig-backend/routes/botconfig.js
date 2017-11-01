const express = require('express');
const requestPromise = require('request-promise');
const router = express.Router();
const ILuis = require('luis-node-sdk');

var APPID = "4f51b70e-cc17-46b8-8009-801a34e28c90";
const APPKEY = "ed2ff1a97f924b8e8a1402e6700a8bf4";

const messages = {
    "agentNotFound": "The specified agent could not be found: ",
    "agentAlreadyExists": "An agent with that name already exists!",
    "agentDeleted": "The agent has been deleted successfully",
    "agentHasBeenCreated": "The agent has been created successfully",
    "botsFound": "All bots has been returned.",
    "errorWhileCreating": "Error while creating the bot, please try again."
};

const LUISKEY = "ed2ff1a97f924b8e8a1402e6700a8bf4";
let LUISClient;
function responseToClient(res, status, error, message, add) {
    let responseMessage = {
        "status": status,
        "error": error,
        "message": message,
        "extra": add || {}
    };

    res.status(status).send(JSON.stringify(responseMessage));
}
/**

 *
 * @param id Name of Bot
 * @returns
 *      {
 *          "exists": true when a bot with this name exists,
 *          "agentResponse": Response from Luis with Information about Agent
 *      }
 */
function existsAgent(id) {
    return new Promise(function (resolve) {
        let options = {
            uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id,
            method: 'GET',
            headers: {
                "Ocp-Apim-Subscription-Key": APPKEY
            },
            json: true
        };
        requestPromise(options).then(res => {
            resolve({
                "exists": true,
                res
            });
        }).catch(res => {
            resolve({
                "exists": false
            });
        });
    })
};

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t)
    });
}


router.get("/bot", function (req, clientResponse) {
    clientResponse.header("Access-Control-Allow-Origin", "*");
    clientResponse.setHeader("Content-Type", "text/html; charset=utf-8");
    let options = {
        "uri": "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/",
        "method": "GET",
        "headers": {
            "Ocp-Apim-Subscription-Key": APPKEY
        },
        json: true
    };

    requestPromise(options).then(res => {
        console.log(res);
        responseToClient(clientResponse, 200, false, messages.botsFound, res);
    }).catch(err => {
        responseToClient(clientResponse, 443, true, err.message);
    });

});

router.delete("/bot/:id", function (req, clientResponse) {
    // options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + exres.agentResponse.id;
    clientResponse.header("Access-Control-Allow-Origin", "*");
    let id = req.params.id;
    let options = {
        uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + id,
        method: 'DELETE',
        headers: {
            "Ocp-Apim-Subscription-Key": APPKEY
        },
        json: true
    }
    existsAgent(id).then(res => {
        if (!res.exists) {
            responseToClient(clientResponse, 404, true, messages.agentNotFound);
        }

        else {
            requestPromise(o
                ptions).then(res => {
                responseToClient(clientResponse, 200, false, messages.agentDeleted);
            }).catch(err => {
                responseToClient(clientResponse, 400, true, err.message);
            })
        }
    }).catch(err => {
        responseToClient(clientResponse, 400, true, err.message);
    })
});

router.get('/bot/:id/query/:query', function (req, clientResponse) {
    res.header("Access-Control-Allow-Origin", "*");
    const id = req.params.id;
    const query = req.params.query;

    existsAgent(id).then(res => {
        if(res.exists){
            LUISClient = LUISClient({
                appId:id,
                appKey:APPKEY,
                verbose:true
            });
            LUISClient.predict(query, {
                onSuccess: function(response){
                    responseToClient(clientResponse, 200, false, response.topScoringIntent.intent);
                }
            })
        } else {
            responseToClient(clientResponse, 404, true, messages.agentNotFound);
        }
    })

});

// TEST DELETE
router.get("/test", function (req, clientresponse) {
    con.connect()
});


router.post('/bot', function (req, clientResponse) {
    let exampleJson = {
        "name": "",
        "Intents": [
            
            {
                "name": "",
                "answer": "",
                "questions": []
            }
        ]
    };
    let appId = "";
    let userData = req.body;
    const initVersion = "1.0";
    let numberOfQuestions = 0;
    let questionsDelivered = 0;
    let options = {
        uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/",
        method: "POST",
        body: {
            "name": userData.name,
            "description": "",
            "culture": "en-us",
            "usageScenario": "IoT",
            "domain": "Comics",
            "initialVersionId": initVersion
        },
        headers: {
            "Ocp-Apim-Subscription-Key": APPKEY
        },
        json: true
    };

    requestPromise(options)
        .then(res => {
            appId = res;
            options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + appId + "/versions/" + initVersion + "/intents";
            for (let i = 0; i < userData.Intents.length; i++) {
                let currentIntent = userData.Intents[i];
                options.body = {
                    name: userData.Intents[i].name
                };
                setTimeout(() => {
                    requestPromise(options);
                }, 20);
            }
            return new Promise(ret => {
                ret();
            })
        })
        .then(res => {
            options.method = "GET";
            return new Promise(function (resolve) {
                let waitUntilIntentsCreatedIntervall = setInterval(() => {
                    requestPromise(options)
                        .then(res => {
                            if (res.length >= userData.Intents.length) {
                                clearInterval(waitUntilIntentsCreatedIntervall);
                                resolve(res);
                            }
                        })
                }, 500)
            })
        })
        .then(res => {
            options.method = "POST";
            console.log("Post Quests");
            options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + appId + "/versions/" + initVersion + "/examples";
            for (let i = 0; i < userData.Intents.length; i++) {
                let currentIntent = userData.Intents[i];
                options.body = [];
                for (let j = 0; j < userData.Intents.length; j++) {
                    options.body.push({
                        "text": currentIntent.questions[j],
                        "intentName": currentIntent.name,
                        "entityLabels": []
                    });
                    numberOfQuestions++;
                }
                setTimeout(() => {
                    requestPromise(options);
                }, 20);
            }
            return new Promise(ret => {
                ret();
            })
        })
        .then(res => {
            options.method = "GET";
            return new Promise(function (resolve) {
                let waitUntilIntentsCreatedIntervall = setInterval(() => {
                    requestPromise(options)
                        .then(res => {
                            if (res.length >= numberOfQuestions) {
                                clearInterval(waitUntilIntentsCreatedIntervall);
                                options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + appId + "/versions/" + initVersion + "/train";
                                options.method = "POST";
                                resolve(res);
                            }
                        })
                }, 500)
            })
        })
        .then(() => requestPromise(options))
        .then(res => {
            options.method = "GET";
            return new Promise(function (resolve) {
                let waitUntilIntentsCreatedIntervall = setInterval(() => {
                    requestPromise(options)
                        .then(res => {
                            let trainingDone = true;
                            for (let i = 0; i < res.length && trainingDone; i++) {
                                if (res[i].details.statusId === 1) {
                                    // TODO maybe retrain?
                                    throw new Error(messages.errorWhileCreating, 409);
                                }
                                if (res[i].details.statusId !== 0) {
                                    trainingDone = false;
                                }
                            }
                            if (trainingDone) {
                                clearInterval(waitUntilIntentsCreatedIntervall);
                                options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + appId + "/publish";
                                options.method = "POST";
                                options.body = {
                                    "versionId": "1.0",
                                    "isStaging": false,
                                    "region": "westus"
                                }
                                resolve(res);
                            }
                        })
                }, 500)
            })
        })
        .then(() => requestPromise(options))
        .then(res => {
            responseToClient(clientResponse, 201, false, messages.agentHasBeenCreated, res);
        })
        .catch(err => {
                console.log(err.statusCode);
                console.log(err.message);
                if (err.statusCode === 400) {
                    responseToClient(clientResponse, 409, true, messages.agentAlreadyExists);
                } else if (err.statusCode === 409) {
                    responseToClient(clientResponse, 409, true, messages.errorWhileCreating);
                    options.uri = "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/" + appId
                    options.method = "DELETE";
                    requestPromise(options);
                } else {
                    responseToClient(clientResponse, err.statusCode, err.message);
                }
            }
        );


});

module.exports = router;
