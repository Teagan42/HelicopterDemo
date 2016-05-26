var http = require('http');

/**
 * Route incoming request based on type
 */
exports.handler = function (event, context) {
    console.log('Routing request');
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Session start event.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Skill launch without specification.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Skill launch with specification.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId +
        ", intentName=" + intentRequest.intent.name);
    console.log(intentRequest.intent);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    switch (intentName) {
        case "SetPinIntent":
            setPinInSession(intent, session, callback);
            break;
        case "GetPinIntent":
            getPinNumberFromSession(intent, session, callback);
            break;
        case "LaunchHelicopterIntent":
            launchHelicopter(intent, session, callback);
            break;
        case "AMAZON.HelpIntent":
            getWelcomeResponse(callback);
            break;
        case "AMAZON.StopIntent":
        case "AMAZON.CancelIntent":
            handleSessionEndRequest(callback);
            break;
        default:
            throw "Invalid Intent";
    }
}

/**
 * On session ended event
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the launch pad. " +
        "Initialize the launch pin before initiating launch.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Start by saying, set the launch pin to four";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Bird is in the air!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function setPinInSession(intent, session, callback) {
    var pinNumberSlot = intent.slots.PinNumber;
    var sessionAttributes = {};
    var speechOutput = "";
    var repromptText = "";
    var shouldEndSession = false;
    var cardTitle = "CARD TITLE";

    if (pinNumberSlot) {
        var pinNumber = pinNumberSlot.value;
        sessionAttributes = createPinNumberAttributes(pinNumber);
        speechOutput = "Pin " + pinNumber + " has been set for ignition.";
        repromptText = "You can now launch the helicopter by saying, launch the helicopter";
    } else {
        speechOutput = "That is not a valid pin number. Please try again.";
        repromptText = "That is not a valid pin number. You can set the pin number by saying, set the launch pin.";
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function createPinNumberAttributes(pinNumber) {
    return {
        pinNumber: pinNumber
    };
}

function getPinNumberFromSession(intent, session, callback) {
    var pinNumber;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        pinNumber = session.attributes.pinNumber;
    }

    if (pinNumber) {
        speechOutput = "The launch pin is " + pinNumber + ".";
    } else {
        speechOutput = "I'm not sure what the launch pin is, you can say set launch pin 4.";
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function launchHelicopter(intent, session, callback) {
    var pinNumber;
    var repromptText = "";
    var speechOutput = "";
    var shouldEndSession = true;

    if (session.attributes) {
        pinNumber = session.attributes.pinNumber;
    }

    if (pinNumber) {
        // TODO : Call Endpoint
        speechOutput = "Launch initiated!";
        repromptText = null;
        shouldEndSession = true;
    } else {
        speechOutput = "Please set the launch pin before launching.";
        repromptText = "Set the launch pin before launching by saying, set launch pin 4.";
        shouldEndSession = false;
    }

    callback({},
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function sendPostRequest(host, endpoint, body, completedCallback, errorCallback) {
    var messageString = JSON.stringify(body);

    // Options and headers for the HTTP request
    var options = {
        host: host,
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {"content-type": "application/json"}
    };

    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');

        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });

        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {
            console.log('Response: ' + responseString);
            completedCallback('API request sent successfully.');
        });
    });

    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        errorCallback('API request completed with error(s).');
    });

    // Send the HTTP request to the Twilio API.
    // Log the message we are sending to Twilio.
    console.log('API call: ' + messageString);
    req.write(messageString);
    req.end();
}

function piConnectionError(err, sessionAttributes, title, callback) {
    console.log(err);
    var speechOutput = "There was an error connecting with the pi.";
    var repromptText = "Unable to set the launch pin, please try again.";
    callback(sessionAttributes,
        buildSpeechletResponse(title, speechOutput, repromptText, false));
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}