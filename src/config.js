const dotenv = require("dotenv");

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required in your .env file`);
  }
  return value;
}

function optional(name) {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : null;
}

module.exports = {
  token: required("DISCORD_TOKEN"),
  clientId: required("CLIENT_ID"),
  guildId: optional("GUILD_ID"),
  logChannelId: optional("LOG_CHANNEL_ID")
};
