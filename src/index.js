const {
  Client,
  Collection,
  Events,
  GatewayIntentBits
} = require("discord.js");
const config = require("./config");
const { commands } = require("./commands");
const { logInfo, logError } = require("./logger");
const { deployCommands } = require("./deploy-commands");

const intents = [GatewayIntentBits.Guilds];
if (config.enableMemberEvents) {
  intents.push(GatewayIntentBits.GuildMembers);
}

const client = new Client({
  intents
});

client.commands = new Collection();
for (const command of commands) {
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, (readyClient) => {
  logInfo(`Logged in as ${readyClient.user.tag}`);
});

client.once(Events.ClientReady, async () => {
  try {
    await deployCommands();
    logInfo("Slash commands are ready.");
  } catch (error) {
    logError("Automatic command deployment failed", error);
  }
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

client.on(Events.GuildMemberAdd, async (member) => {
  if (!config.enableMemberEvents || !config.welcomeChannelId) return;

  try {
    const channel = await member.client.channels.fetch(config.welcomeChannelId);
    if (!channel || !channel.isTextBased()) return;

    await channel.send(
      `Welcome ${member.user} to **${member.guild.name}**! Hello and enjoy your stay.`
    );
  } catch (error) {
    logError("Failed to send welcome message", error);
  }
});

client.login(config.token).catch((error) => {
  logError("Login failed", error);
  process.exit(1);
});
