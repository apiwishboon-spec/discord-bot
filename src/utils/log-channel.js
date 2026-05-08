const { logError } = require("../logger");

async function sendToLogChannel(client, logChannelId, payload) {
  if (!logChannelId) return;

  try {
    const channel = await client.channels.fetch(logChannelId);
    if (!channel || !channel.isTextBased()) return;
    await channel.send(payload);
  } catch (error) {
    logError(`Failed to send moderation log to channel ${logChannelId}`, error);
  }
}

module.exports = {
  sendToLogChannel
};
