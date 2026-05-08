const {
  Client,
  Collection,
  Events,
  GatewayIntentBits
} = require("discord.js");
const config = require("./config");
const { commands } = require("./commands");
const { logInfo, logError } = require("./logger");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  logInfo(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: "Unknown command.", ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction, { logChannelId: config.logChannelId });
  } catch (error) {
    logError(`Command failed: /${interaction.commandName}`, error);
    const message = "Something went wrong while running this command.";

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
      return;
    }

    await interaction.reply({ content: message, ephemeral: true });
  }
});

client.login(config.token).catch((error) => {
  logError("Login failed", error);
  process.exit(1);
});
