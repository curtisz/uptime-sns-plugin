/**
 * AWS SNS Notification plugin
 *
 * Notifies all events (up, down, paused, restarted) by Amazon's Simple Notification Services
 *
 * Installation
 * ------------
 * Install this plugin using npm:
 * 
 *   $ npm install uptime-sns
 *
 * Now add the following lines to plugins/index.js:
 * 
 *   exports.init = function() {
 *     require('uptime-sns').init();
 *   }
 *
 * Usage
 * -----
 * This plugin sends an email each time a check is started, goes down, or goes back up. 
 * When the check goes down, the email contains the error details:
 *
 *   Object: [Down] Check "FooBar" just went down
 *   On Thursday, September 4th 1986 8:30 PM,
 *   a test on URL "http://foobar.com" failed with the following error:
 *
 *     Error 500
 *
 *   Uptime won't send anymore notifications about this check until it goes back up.
 *   ---------------------------------------------------------------------
 *   This is an automated notification sent from Uptime. Please don't reply to it.
 *
 * Configuration
 * -------------
 * Here is an example configuration:
 *
 *   // in config/production.yaml
 *   sns:
 *     auth:
 *       user: 		AWS SNS KEY           # SNS API access ID
 *       secret: 	AWS SNS SECRET        # SNS API secret key
 *     options:
 *       region:      'us-east-1'           # AWS SNS region
 *       topicArn:    'arn:aws:sns:us-east-1:0123457816:Notify' # AWS topic ARN
 *     event:
 *       up: 		true
 *       down: 		true
 *       paused: 	false
 *       restarted: false
 *
 */
var AWS 		= require('aws-sdk');
var fs			= require('fs');
var CheckEvent		= require('./models/checkEvent.js');
var ejs			= require('ejs');
var moment 		= require('moment');

exports.init = function(options) {
	var config = options.config.sns;
	var sns = new AWS.SNS({
		apiVersion: '2010-03-31',
		region: config.options.region,
		accessKeyId: config.auth.access,
		secretAccessKey: config.auth.secret
	});
	var templateDir = __dirname + '/views/';
	CheckEvent.on('afterInsert', function(checkEvent) {
		if (!config.event[checkEvent.message]) return;
		checkEvent.findCheck(function(err, check) {
			if (err) return console.error(err);
			var filename = templateDir + checkEvent.message + '.ejs';
			var renderOptions = {
				check: check,
				checkEvent: checkEvent,
				url: options.config.url,
				moment: moment,
				filename: filename
			};
			var lines = ejs.render(fs.readFileSync(filename, 'utf8'), renderOptions).split('\n');
			var SNSOptions = {
				Subject: lines.shift(),
				Message: lines.join('\n'),
				TopicArn: config.options.topicArn
			};
			sns.publish(SNSOptions, function(err2, data) {
				if (err2) return console.error('SNS plugin error: %s', err2);
				console.log('Notified event by AWS SNS: Check '+check.name+' '+checkEvent.message);
			});
		});
	});
	console.log('Enabled AWS SNS notifications');
};

