const { REST, Routes } = require("discord.js");
const { commands } = require("./commands");
const config = require("./config");
const { logInfo, logError } = require("./logger");

async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());

  try {
    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body }
      );
      logInfo(`Deployed ${body.length} guild slash command(s) to ${config.guildId}`);
      return;
    }

    await rest.put(Routes.applicationCommands(config.clientId), { body });
    logInfo(`Deployed ${body.length} global slash command(s)`);
  } catch (error) {
    logError("Failed to deploy commands", error);
    process.exitCode = 1;
  }
}

deployCommands();
