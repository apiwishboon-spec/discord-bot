const { SlashCommandBuilder } = require("discord.js");

const commands = [
  {
    data: new SlashCommandBuilder()
      .setName("hello")
      .setDescription("Say hello to Boon Bot"),
    async execute(interaction) {
      await interaction.reply(`Hello ${interaction.user}, I am Boon Bot 🤖`);
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check if the bot is responsive"),
    async execute(interaction) {
      const latencyMs = Math.round(interaction.client.ws.ping);
      await interaction.reply(`Pong! \`${latencyMs}ms\``);
    }
  }
];

module.exports = commands;
