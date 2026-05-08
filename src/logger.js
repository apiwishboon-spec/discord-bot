function timestamp() {
  return new Date().toISOString();
}

function logInfo(message) {
  console.log(`${timestamp()} | INFO  | ${message}`);
}

function logError(message, error) {
  console.error(`${timestamp()} | ERROR | ${message}`);
  if (error) {
    console.error(error);
  }
}

module.exports = {
  logInfo,
  logError
};
