uptime-sns-plugin
=================

AWS SNS plugin for Fzaninotto's awesome [Uptime](https://github.com/fzaninotto/uptime) monitoring app, inspired by [uptime-webhooks](https://github.com/mintbridge/uptime-webhooks) and the default email plugin.

To use this plugin, install it via npm while in the Uptime directory:

```sh
	$ npm install uptime-sns
```

To enable the plugin, two things need to be accomplished. First, add the plugin to `plugins/index.js`:

```sh
  exports.init = function() {
    require('./sns').init();
  }
```

Finally, add the following lines to the plugins section of your config file:

```yaml
  plugins:
    sns:
      auth:
        user:		AWS_ACCESS_ID
	secret:		AWS_SECRET_KEY
      options:
        region:		'us-east-1'
        topicArn:	'arn:aws:sns:us-east-1:012345678910:Notify' # AWS target ARN
      event:
        up:		true
        down:		true
        paused:         false
        restarted:      false
```

An example configuration is provided in `config/config.example.yaml`.

License
=======

This plugin is released under MIT license.
