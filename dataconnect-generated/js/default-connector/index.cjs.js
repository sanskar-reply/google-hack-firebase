const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'ai-app',
  location: 'europe-west2'
};
exports.connectorConfig = connectorConfig;

