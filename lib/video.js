/* video.js - Re-usable module to  */

var path = require('path');

module.exports = VideoOverlay;


function VideoOverlay(options) {

	// this.eventbus;
	// this.name;
	// this.video;

	var self;			// Used for scope when passing around events
	self = this;

	if(!options.video) {
		throw new Error("You must specify a Video URL");
	}
	if(!options.trigger) {
		throw new Error("You must specify a trigger to listen for in chat")
	}
	if(!options.eventbus) {
		throw new Error("You must pass in an eventemitter to listen and send events");
	}

	// Required options
	this.video = {												// absolute path to video. Will include 'filename' and 'directory' parameters.
		filename: path.basename(options.video),
		directory: path.dirname(options.video)
	};
	this.name = options.trigger;					// Unique identifier and command the bot will listen for in chat
	this.eventbus = options.eventbus; 		// Global event bus that modules can pub/sub to

	// Configure Chat triggers so the bot listens for this command
	this.triggers = [{
		name: this.name,	// Command used to trigger the video
		type: options.type ? options.type : 'whisper',
		whitelist: options.whitelist ? options.whitelist : true,
		event: this.name + ':show'
	}];

	// Setup an overlay to display a house when someone gets sorted
	this.overlay = {
		name: this.name,									// The name of your overlay (for internal referral)
	  event: 'stream:' + this.name,  						// The event that shows your overlay (required)
	  view: path.join(__dirname, 'views/video.pug'),  // The view you want to be rendered (required)
	  selector: '#' + this.name,  						// The selector to select your template (optional: default to a class w/ the  .name of the overlay)
		directory: this.video.directory					// Grab the current directory
	};

	this.showVideo = function () {
		// When the video overlay is triggered, what video should we show?
		var response = [];

		// Load the items to show on stream
		var payload = self.assemblePayload();
		self.eventbus.emit(self.overlay.event, payload);
	}

	this.assemblePayload = function () {
			// Put data into the proper format to be read by our stream overlay's template
			var payload = {};

			payload.video = this.video.filename;
			payload.delay = 14000;

			return(payload);
		}


	// Add event listeners from Twitch chat
	this.eventbus.on(this.triggers[0].event, this.showVideo);
};