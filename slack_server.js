Slack = {};

OAuth.registerService('slack', 2, null, function(query) {
  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);

  return {
    serviceData: {
      id: identity.user_id,
      accessToken: accessToken
    },
    options: { profile: {
      name: identity.user,
      url: identity.url,
      team: identity.team,
      user_id: identity.user_id,
      team_id: identity.team_id
    } }
  };
});

var getAccessToken = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'slack'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://slack.com/api/oauth.access", {
        headers: {
          Accept: 'application/json'
        },
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
  //        redirect_uri: Meteor.absoluteUrl("_oauth/slack?close")
          redirect_uri: OAuth._redirectUri('slack', config),
          state: query.state
        }
      });
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Slack. " + err.message),
                   {response: err.response});
  }

  if (!response.data.ok) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Slack. " + response.data.error);
  } else {
    return response.data.access_token;
  }
};

var getIdentity = function (accessToken) {
  try {
    var response = HTTP.get(
      "https://slack.com/api/auth.test",
      {params: {token: accessToken}});

    return response.data.ok && response.data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Slack. " + err.message),
                   {response: err.response});
  }
};


Slack.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
