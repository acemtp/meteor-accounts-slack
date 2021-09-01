Package.describe({
  summary: 'Login service for Slack accounts',
  version: '1.2.0',
  git: 'https://github.com/efounders/meteor-accounts-slack.git',
  name: 'acemtp:accounts-slack',
});

Package.onUse(api => {
  api.versionsFrom('METEOR@2.3.5');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('templating', 'client');
  api.use('underscore', 'client');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);
  api.use('accounts-base', ['client', 'server']);
  api.use('accounts-oauth', ['client', 'server']);

  api.addFiles('slack_server.js', 'server');

  api.addFiles(
    ['slack_login_button.css', 'slack_client.js', 'slack_configure.html', 'slack_configure.js'],
    'client',
  );

  api.addFiles('slack.js');
});
