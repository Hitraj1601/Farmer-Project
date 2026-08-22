const { Client } = require("@elastic/elasticsearch");

const esNode = process.env.ELASTICSEARCH_NODE || process.env.ELASTICSEARCH_URL;

let client = null;
let isConnected = false;

if (esNode) {
  try {
    client = new Client({
      node: esNode,
      maxRetries: 3,
      requestTimeout: 5000,
      sniffOnStart: false,
    });
  } catch (err) {
    console.warn("Elasticsearch client initialization warning:", err.message);
  }
}

const checkConnection = async () => {
  if (!client) {
    isConnected = false;
    return false;
  }
  try {
    await client.ping();
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    console.warn("Elasticsearch ping failed. Fallback to database search:", err.message);
    return false;
  }
};

const getClient = () => client;
const isElasticConnected = () => isConnected;

module.exports = {
  client,
  getClient,
  checkConnection,
  isElasticConnected,
};
