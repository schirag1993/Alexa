const Alexa = require('alexa-sdk');
var constants = require('./constants');
var stateHandlers = require('./stateHandlers');
var audioEventHandlers = require('./audioEventHandlers');

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = constants.appId;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
      stateHandlers.startModeIntentHandlers,
      stateHandlers.playModeIntentHandlers,
      stateHandlers.resumeDecisionModeIntentHandlers,
      audioEventHandlers);
    alexa.execute();
};
