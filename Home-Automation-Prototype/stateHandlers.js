'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

const deviceID = '*****';
const iotHubName = 'offi*****';
const primaryKey = 'DXA8jgjLCB*******bKfKlzFmXk=';
const connectionString = 'HostName=' + iotHubName + '.azure-devices.net;DeviceId=' + deviceID + ';SharedAccessKey=' + primaryKey;
const client = clientFromConnectionString(connectionString);

var stateHandlers = {
    startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {

      'lightControl' : function()
      {
      var slots = this.event.request.intent.slots;
          var roomName = slots.room.value; //this.event.request.intent.slots.SLOT_NAME.value
          var lightState = slots.state.value;
      var that = this;
      lightCommand(roomName, lightState, function(status){
        console.log("Inside light command");
        if(!status)
        {
          console.log("Completed transmission with error");
          that.emit(':tell', 'I failed to change the light state. My apologies');
        }
        else
        {
          console.log("Completed transmission successfully");
          that.emit(':tell', 'Changing light state of ' + roomName);
        }
        });
      },
      'SessionEndedRequest' : function () {
          // No session ended logic
          this.handler.state = constants.states.START_MODE;
      },
      'Unhandled' : function () {
          this.handler.state = constants.states.START_MODE;
          var message = 'Sorry, I could not understand. Currently in start mode.';
          this.response.speak(message).listen(message);
          this.emit(':responseReady');
      },
      'swagMode' : function() {
      //Secret party mode here
      },
      'windowControl' : function() {
      //window blinds (open/close) here
      },
      'fanControl' : function() {
      //fan speed regulation and on/off here
      },
      'moodLighting' : function() {
      //LED strip control here
      },
      'temperatureControl': function () {
      var slots = this.event.request.intent.slots;
      var that = this;
      var hvacID = 'AC01'; //Setting static ID because second AC is not installed yet
      if(slots.increaseDecrease.value)
      {
        var tempIncreaseDecrease = slots.increaseDecrease.value;
        if(tempIncreaseDecrease == 'increase' || tempIncreaseDecrease == 'up')
        {
          acCommand(hvacID,'NULL',99,tempIncreaseDecrease, function(status)
          {
            console.log("Inside acCommand for increase/decrease");
            if(!status)
            {
            console.log("Completed transmission with error");
            that.emit(':tell', 'I failed to change the AC state. My apologies');
            }
            else
            {
            console.log("Completed transmission successfully");
            that.emit(':tell', 'Increasing the temperature');
            }
          });
          //this.emit(':tell','Increasing temperature');
        }
        else
        {
          acCommand(hvacID,'NULL',99,tempIncreaseDecrease, function(status)
          {
            console.log("Inside acCommand for increase/decrease");
            if(!status)
            {
            console.log("Completed transmission with error");
            that.emit(':tell', 'I failed to change the AC state. My apologies');
            }
            else
            {
            console.log("Completed transmission successfully");
            that.emit(':tell', 'Decreasing the temperature');
            }
          });
          //this.emit(':tell','Decreasing temperature');
        }
      }
      else if(slots.tempValue.value)
      {
        var targetTemp = slots.tempValue.value;
        var that = this;
        acCommand(hvacID,'NULL',targetTemp,'NULL', function(status)
          {
            console.log("Inside acCommand for setting temperature");
            if(!status)
            {
            console.log("Completed transmission with error");
            that.emit(':tell', 'I failed to change the temperature. My apologies');
            }
            else
            {
            console.log("Completed transmission successfully");
            that.emit(':tell', 'Changing the room temperature to ' + targetTemp + ' degrees');
            }
          });
        //this.emit(':tell','Setting temperature to ' + targetTemp + ' degrees');
      }
      else if(slots.state.value)
      {
        if(slots.state.value == 'on')
        {
          acCommand(hvacID,'on','NULL','NULL', function(status)
          {
            console.log("Inside acCommand for setting temperature");
            if(!status)
            {
            console.log("Completed transmission with error");
            that.emit(':tell', 'I failed to switch the A.C. on. My apologies');
            }
            else
            {
            console.log("Completed transmission successfully");
            that.emit(':tell', 'Switching the air conditioning on.');
            }
          });
          //this.emit(':tell','Switching A. C. on');
        }
        else
        {
          acCommand(hvacID,'off','NULL','NULL', function(status)
          {
            console.log("Inside acCommand for setting temperature");
            if(!status)
            {
            console.log("Completed transmission with error");
            that.emit(':tell', 'I failed to switch the A.C. off. My apologies');
            }
            else
            {
            console.log("Completed transmission successfully");
            that.emit(':tell', 'Switching the air conditioning off.');
            }
          });
          //this.emit(':tell','Switching A. C. off');
        }
      }
      else
      {
        this.emit(':tell','I\'m sorry, you need to be more specific')
      }
    },
        /*
         *  All Intent Handlers for state : START_MODE
         */
        'LaunchRequest' : function () {
            // Initialize Attributes
            this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            var message = 'Welcome to a world of awesome. Are you ready?';
            var reprompt = 'You can try a bunch of things. Go ahead.';

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'musicControl' : function () {
            if (!this.attributes['playOrder']) {
                // Initialize Attributes if undefined.
                this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['loop'] = true;
                this.attributes['shuffle'] = false;
                this.attributes['playbackIndexChanged'] = true;
                //  Change state to START_MODE
                this.handler.state = constants.states.START_MODE;
            }
            controller.play.call(this);
        },
        'AMAZON.HelpIntent' : function () {
            var message = 'This is a skill to control the I. o. T. lab or launch a party. Try me out';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            var message = 'Good bye.';
            this.attributes['STATE'] = constants.states.START_MODE;
            this.handler.state = constants.states.START_MODE;
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            var message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
            this.handler.state = constants.states.START_MODE;
        }
    }),
    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
         'lightControl' : function()
         {
         var slots = this.event.request.intent.slots;
             var roomName = slots.room.value; //this.event.request.intent.slots.SLOT_NAME.value
             var lightState = slots.state.value;
         var that = this;
         lightCommand(roomName, lightState, function(status){
           console.log("Inside light command");
           if(!status)
           {
             console.log("Completed transmission with error");
             that.emit(':tell', 'I failed to change the light state. My apologies');
           }
           else
           {
             console.log("Completed transmission successfully");
             that.emit(':tell', 'Changing light state of ' + roomName);
           }
           });
         },
         'SessionEndedRequest' : function () {
             // No session ended logic
             this.handler.state = constants.states.START_MODE;
         },
         'Unhandled' : function () {
             this.handler.state = constants.states.START_MODE;
             var message = 'Sorry, I could not understand. Currently in start mode.';
             this.response.speak(message).listen(message);
             this.emit(':responseReady');
         },
         'swagMode' : function() {
         //Secret party mode here
         },
         'windowControl' : function() {
         //window blinds (open/close) here
         },
         'fanControl' : function() {
         //fan speed regulation and on/off here
         },
         'moodLighting' : function() {
         //LED strip control here
         },
         'temperatureControl': function () {
         var slots = this.event.request.intent.slots;
         var that = this;
         var hvacID = 'AC01'; //Setting static ID because second AC is not installed yet
         if(slots.increaseDecrease.value)
         {
           var tempIncreaseDecrease = slots.increaseDecrease.value;
           if(tempIncreaseDecrease == 'increase' || tempIncreaseDecrease == 'up')
           {
             acCommand(hvacID,'NULL',99,tempIncreaseDecrease, function(status)
             {
               console.log("Inside acCommand for increase/decrease");
               if(!status)
               {
               console.log("Completed transmission with error");
               that.emit(':tell', 'I failed to change the AC state. My apologies');
               }
               else
               {
               console.log("Completed transmission successfully");
               that.emit(':tell', 'Increasing the temperature');
               }
             });
             //this.emit(':tell','Increasing temperature');
           }
           else
           {
             acCommand(hvacID,'NULL',99,tempIncreaseDecrease, function(status)
             {
               console.log("Inside acCommand for increase/decrease");
               if(!status)
               {
               console.log("Completed transmission with error");
               that.emit(':tell', 'I failed to change the AC state. My apologies');
               }
               else
               {
               console.log("Completed transmission successfully");
               that.emit(':tell', 'Decreasing the temperature');
               }
             });
             //this.emit(':tell','Decreasing temperature');
           }
         }
         else if(slots.tempValue.value)
         {
           var targetTemp = slots.tempValue.value;
           var that = this;
           acCommand(hvacID,'NULL',targetTemp,'NULL', function(status)
             {
               console.log("Inside acCommand for setting temperature");
               if(!status)
               {
               console.log("Completed transmission with error");
               that.emit(':tell', 'I failed to change the temperature. My apologies');
               }
               else
               {
               console.log("Completed transmission successfully");
               that.emit(':tell', 'Changing the room temperature to ' + targetTemp + ' degrees');
               }
             });
           //this.emit(':tell','Setting temperature to ' + targetTemp + ' degrees');
         }
         else if(slots.state.value)
         {
           if(slots.state.value == 'on')
           {
             acCommand(hvacID,'on','NULL','NULL', function(status)
             {
               console.log("Inside acCommand for setting temperature");
               if(!status)
               {
               console.log("Completed transmission with error");
               that.emit(':tell', 'I failed to switch the A.C. on. My apologies');
               }
               else
               {
               console.log("Completed transmission successfully");
               that.emit(':tell', 'Switching the air conditioning on.');
               }
             });
             //this.emit(':tell','Switching A. C. on');
           }
           else
           {
             acCommand(hvacID,'off','NULL','NULL', function(status)
             {
               console.log("Inside acCommand for setting temperature");
               if(!status)
               {
               console.log("Completed transmission with error");
               that.emit(':tell', 'I failed to switch the A.C. off. My apologies');
               }
               else
               {
               console.log("Completed transmission successfully");
               that.emit(':tell', 'Switching the air conditioning off.');
               }
             });
             //this.emit(':tell','Switching A. C. off');
           }
         }
         else
         {
           this.emit(':tell','I\'m sorry, you need to be more specific')
         }
       },
      'LaunchRequest' : function () {
            /*
             *  Session resumed in PLAY_MODE STATE.
             *  If playback had finished during last session :
             *      Give welcome message.
             *      Change state to START_STATE to restrict user inputs.
             *  Else :
             *      Ask user if he/she wants to resume from last position.
             *      Change state to RESUME_DECISION_MODE
             */
            var message;
            var reprompt;
            if (this.attributes['playbackFinished']) {
                this.handler.state = constants.states.START_MODE;
                message = 'Welcome to awesome my friend. You can say, play the audio to begin the playlist.';
                reprompt = 'You can say, play the audio, to begin.';
            } else {
                this.handler.state = constants.states.RESUME_DECISION_MODE;
                message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                    ' Would you like to resume?';
                reprompt = 'You can say yes to resume or no to play from the top.';
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'musicControl' : function () { controller.play.call(this) },
        'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () {
          this.handler.state = constants.states.START_MODE;
          this.attributes['STATE'] = constants.states.START_MODE;
          controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
        'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
        'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
        'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
        'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = 'This skill is for office automation and only office automation. Nothing out of the ordinary here.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
            this.attributes['STATE'] = constants.states.START_MODE;
            this.handler.state = constants.states.START_MODE;
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. I am in play mode';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    resumeDecisionModeIntentHandlers : Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
        /*
         *  All Intent Handlers for state : RESUME_DECISION_MODE
         */
        'LaunchRequest' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['index']].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.StopIntent' : function () {
            var message = 'Good bye. Was inside resume mode.';
            this.attributes['STATE'] = constants.states.START_MODE;
            this.handler.state = constants.states.START_MODE;
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'AMAZON.CancelIntent' : function () {
            var message = 'Good bye.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
            this.handler.state = constants.states.START_MODE;
        },
        'Unhandled' : function () {
            var message = 'Sorry, this is not a valid command. Inside resume decision mode.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    })
};

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }

            var token = String(this.attributes['playOrder'][this.attributes['index']]);
            var playBehavior = 'REPLACE_ALL';
            var playlist = audioData[this.attributes['playOrder'][this.attributes['index']]];
            var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes['enqueuedToken'] = null;

            if (canThrowCard.call(this)) {
                var cardTitle = 'Playing ' + playlist.title;
                var cardContent = 'Playing ' + playlist.title;
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.audioPlayerPlay(playBehavior, playlist.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.attributes['STATE'] = constants.states.START_MODE;
            this.handler.state = constants.states.START_MODE;
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            /*
             *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index += 1;
            // Check for last audio file.
            if (index === audioData.length) {
                if (this.attributes['loop']) {
                    index = 0;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;
                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        playPrevious: function () {
            /*
             *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes['loop']) {
                    index = audioData.length - 1;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;
                    var message = 'You have reached the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes['loop'] = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes['loop'] = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        shuffleOn: function () {
            // Turn on shuffle play.
            this.attributes['shuffle'] = true;
            shuffleOrder((newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes['playOrder'] = newOrder;
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                controller.play.call(this);
            });
        },
        shuffleOff: function () {
            // Turn off shuffle play.
            if (this.attributes['shuffle']) {
                this.attributes['shuffle'] = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes['index'] = this.attributes['playOrder'][this.attributes['index']];
                this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            }
            controller.play.call(this);
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' && this.attributes['playbackIndexChanged']) {
        this.attributes['playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
    }
}

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}

function acCommand(acID,acState,acValue,acUpDown, callback)
{
	//acID is static for now [new AC is not set up yet]
	var thingState = 0;
	var thingId = 'NULL';
	var mcu = 'node';
	var status = 0;
	if(acState == 'on')
	{
		thingState = 1;
	}
	else if(acState == 'off' || acState == 'kill')
	{
		thingState = 0;
	}
	if(acValue == 99)
	{
		if(acUpDown == 'increase' || acUpDown == 'up')
		{
			thingState = '+';
		}
		else
		{
			thingState = '-';
		}
	}
	else if(!((acState == 'on') || (acState == 'off' || acState == 'kill')))
	{
		thingState = parseInt(acValue); //ENSURE CONVERSION OF ALPHANUMERIC CHARACTERS TO INTEGER REPRESENTATION PRIOR TO PROCEEDING
	}
	if(acID == 'AC01')
	{
		thingId = 'AC01';
		mcu = 'node01';
	}
	else
	{
		thingId = 'AC02';
		mcu = 'node02';
	}
	var connectCallback = function (err)
	{
	  if (err)
	  {
		console.log('Could not connect: ' + err);
	  }
	  else
	  {
		var jsonMsg = {mcu:mcu,thingId:thingId,thingState:thingState,controllerName:deviceID};
		var data = JSON.stringify(jsonMsg);
		var message = new Message(data);
		client.sendEvent(message, function(err){
			if(!err)
			{
				status=1;
				callback(status)
			}
		});
	  }
	};
	client.open(connectCallback);

}

function lightCommand(roomName, lightState, callback)
{
	var thingState = 0;
	var thingId = 'NULL';
	var mcu = 'node01';
	var status = 0;
	if(lightState == 'on')
	{
		thingState = 1;
	}
	else
	{
		thingState = 0;
	}
	if(roomName == 'hall')
	{
		thingId = 'light01';
	}
	else if(roomName == 'cabin')
	{
		thingId = 'light02';
	}
	else
	{
		thingId = 'light00';
	}

	var connectCallback = function (err)
	{
	  if (err)
	  {
		console.log('Could not connect: ' + err);
	  }
	  else
	  {
		var jsonMsg = {mcu:mcu,thingId:thingId,thingState:thingState,controllerName:deviceID};
		var data = JSON.stringify(jsonMsg);
		var message = new Message(data);
		client.sendEvent(message, function(err){
			//Insert callback logic for successful transmission here
			if(!err)
			{
				status=1;
				callback(status)
			}
		});
	  }
	};
	client.open(connectCallback);
}
