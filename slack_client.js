Slack = {};

// Request Slack credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Slack.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'slack'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  // For some reason, slack converts underscores to spaces in the state
  // parameter when redirecting back to the client, so we use
  // `Random.id()` here (alphanumerics) instead of `Random.secret()`
  // (base 64 characters).
  var credentialToken = Random.id();

  var scope = (options && options.requestPermissions) || [];
  var flatScope = _.map(scope, encodeURIComponent).join(',') || 'identify';

  var loginStyle = OAuth._loginStyle('slack', config, options);

  var loginUrl =
        'https://slack.com/openid/connect/authorize' +
        '?client_id=' + config.clientId +
        '&response_type=code' +
        '&scope=' + flatScope +
        '&redirect_uri=' + OAuth._redirectUri('slack', config) +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken, options.redirectUrl);

  // slack box gets taller when permissions requested.
  var height = 620;
  if (_.without(scope, 'basic').length)
    height += 130;

  OAuth.launchLogin({
    loginService: 'slack',
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: {width: 900, height: height}
  });

/*
  OAuth.showPopup(
    loginUrl,
    _.bind(credentialRequestCompleteCallback, null, credentialToken),
    {width: 900, height: height}
  );
*/
};
