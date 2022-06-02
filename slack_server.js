Slack = {};

OAuth.registerService('slack', 2, null, function(query) {
  var tokens = getTokens(query);
  var identity = getIdentity(tokens.access_token);

  return {
    serviceData: {
      id: identity.user_id,
      accessToken: tokens.access_token
    },
    options: {
      profile: {
        name: identity.user,
        url: identity.url,
        team: identity.team,
        user_id: identity.user_id,
        team_id: identity.team_id
      },
      slack: {
        tokens: tokens,
        identity: identity,
      }
    }
  };
});

var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'slack'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    response = HTTP.post(
      "https://slack.com/api/openid.connect.token", {
        headers: {
          Accept: 'application/json'
        },
        params: {
          code: query.code,
          client_id: config.clientId,
          client_secret: OAuth.openSecret(config.secret),
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
    return response.data;
  }
};

var replaceObjectKeyName = function (obj) {
  Object.keys(obj).forEach(function(v) {
    if (v.includes('https://slack.com/')) {
      obj[v.replace("https://slack.com/", "")] = obj[v];
      delete obj[v];
    }
  });
}

var getIdentity = function (accessToken) {
  try {
    var response = HTTP.get(
      "https://slack.com/api/auth.test",
      {params: {token: accessToken}});

    if (response.data && response.data.ok)
      return response.data;

    response = HTTP.get(
      "https://slack.com/api/openid.connect.userInfo",
      {params: {token: accessToken}});
    if (response.data && response.data.ok) {
      // Replace response object key names including 'https://slack.com/' string
      replaceObjectKeyName(response.data);

      // Simulate the response that auth.test would have returned
      return _.extend(response.data, {
        user: response.data.name,
        user_id: response.data.user_id,
        team_id: response.data.team_id,
        team: response.data.team_name,
        url: `https://${response.data.team_domain}.slack.com/`
      });
    }
    else
      throw new Error("Could not retrieve user identity");
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Slack. " + err.message),
                   {response: err.response});
  }
};


Slack.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
