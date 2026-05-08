const generalCommands = require("./general");
const moderationCommands = require("./moderation");

const commands = [...generalCommands, ...moderationCommands];

module.exports = {
  commands
};
