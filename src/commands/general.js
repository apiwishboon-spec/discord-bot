const { SlashCommandBuilder } = require("discord.js");

const eightBallAnswers = [
  "Yes.",
  "No.",
  "Maybe.",
  "Definitely.",
  "Absolutely not.",
  "Ask again later.",
  "Very likely.",
  "I would not count on it."
];

const rpsBeats = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper"
};

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

const commands = [
  {
    data: new SlashCommandBuilder()
      .setName("hello")
      .setDescription("Say hello to Rick Astley Bot"),
    async execute(interaction) {
      await interaction.reply(`Hello ${interaction.user}, I am Rick Astley Bot 🤖`);
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
  },
  {
    data: new SlashCommandBuilder()
      .setName("8ball")
      .setDescription("Ask the magic 8-ball a question")
      .addStringOption((option) =>
        option.setName("question").setDescription("Your question").setRequired(true)
      ),
    async execute(interaction) {
      const question = interaction.options.getString("question", true);
      const answer = randomFrom(eightBallAnswers);
      await interaction.reply(`🎱 **Question:** ${question}\n**Answer:** ${answer}`);
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("roll")
      .setDescription("Roll a dice")
      .addIntegerOption((option) =>
        option
          .setName("sides")
          .setDescription("Number of sides (default 6)")
          .setMinValue(2)
          .setMaxValue(1000)
      ),
    async execute(interaction) {
      const sides = interaction.options.getInteger("sides") || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      await interaction.reply(`🎲 You rolled **${result}** (1-${sides})`);
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("coinflip")
      .setDescription("Flip a coin"),
    async execute(interaction) {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      await interaction.reply(`🪙 ${result}!`);
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("choose")
      .setDescription("Choose one option from a comma-separated list")
      .addStringOption((option) =>
        option
          .setName("options")
          .setDescription("Example: pizza, burger, sushi")
          .setRequired(true)
      ),
    async execute(interaction) {
      const raw = interaction.options.getString("options", true);
      const options = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (options.length < 2) {
        await interaction.reply({
          content: "Please give at least 2 options separated by commas.",
          ephemeral: true
        });
        return;
      }

      const picked = randomFrom(options);
      await interaction.reply(`🤔 I choose: **${picked}**`);
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("rps")
      .setDescription("Play rock paper scissors with the bot")
      .addStringOption((option) =>
        option
          .setName("choice")
          .setDescription("Your choice")
          .setRequired(true)
          .addChoices(
            { name: "Rock", value: "rock" },
            { name: "Paper", value: "paper" },
            { name: "Scissors", value: "scissors" }
          )
      ),
    async execute(interaction) {
      const userChoice = interaction.options.getString("choice", true);
      const botChoice = randomFrom(["rock", "paper", "scissors"]);

      let result = "It's a draw!";
      if (userChoice !== botChoice) {
        result = rpsBeats[userChoice] === botChoice ? "You win! 🎉" : "You lose! 😅";
      }

      await interaction.reply(
        `You chose **${userChoice}**. I chose **${botChoice}**. ${result}`
      );
    }
  }
];

module.exports = commands;
