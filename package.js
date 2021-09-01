Package.describe({
  name: 'acemtp:accounts-slack',
  version: '1.2.1',
  summary: 'Login service for Slack accounts',
  git: 'https://github.com/acemtp/meteor-accounts-slack.git',
  documentation: 'README.md',
});

Package.onUse(api => {
  api.versionsFrom('2.3.5');

  api.use(['oauth', 'oauth2', 'service-configuration', 'accounts-base', 'accounts-oauth'], ['client', 'server']);

  api.use(['http@1.4.4'], 'server');

  api.use(['blaze-html-templates@1.0.4', 'underscore', 'random'], 'client');

  api.addFiles('slack_server.js', 'server');

  api.addFiles(
    ['slack_login_button.css', 'slack_client.js', 'slack_configure.html', 'slack_configure.js'],
    'client',
  );

  api.addFiles('slack.js');
});
