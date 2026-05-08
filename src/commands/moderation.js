const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Colors
} = require("discord.js");
const { moderationEmbed } = require("../utils/embed");
const { sendToLogChannel } = require("../utils/log-channel");
const { logInfo } = require("../logger");

const commands = [
  {
    data: new SlashCommandBuilder()
      .setName("warn")
      .setDescription("Warn a user with a reason")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to warn").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for warning").setRequired(true)
      ),
    async execute(interaction, context) {
      const target = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason", true);

      const embed = moderationEmbed({
        action: "Warn",
        moderator: interaction.user,
        target,
        reason,
        color: Colors.Orange
      });

      logInfo(
        `WARN | guild=${interaction.guildId} moderator=${interaction.user.id} target=${target.id} reason=${reason}`
      );

      await interaction.reply({ embeds: [embed] });
      await sendToLogChannel(interaction.client, context.logChannelId, { embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("timeout")
      .setDescription("Timeout a user for N minutes")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to timeout").setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("minutes")
          .setDescription("Timeout duration in minutes (1-10080)")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(10080)
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for timeout").setRequired(true)
      ),
    async execute(interaction, context) {
      const targetUser = interaction.options.getUser("user", true);
      const minutes = interaction.options.getInteger("minutes", true);
      const reason = interaction.options.getString("reason", true);
      const targetMember = interaction.options.getMember("user");

      if (!targetMember) {
        await interaction.reply({
          content: "I could not find that member in this server.",
          ephemeral: true
        });
        return;
      }

      try {
        await targetMember.timeout(minutes * 60 * 1000, reason);
      } catch (error) {
        await interaction.reply({
          content: "I do not have permission to timeout that user.",
          ephemeral: true
        });
        return;
      }

      const embed = moderationEmbed({
        action: "Timeout",
        moderator: interaction.user,
        target: targetUser,
        reason,
        color: Colors.Yellow,
        durationMinutes: minutes
      });

      logInfo(
        `TIMEOUT | guild=${interaction.guildId} moderator=${interaction.user.id} target=${targetUser.id} minutes=${minutes} reason=${reason}`
      );

      await interaction.reply({ embeds: [embed] });
      await sendToLogChannel(interaction.client, context.logChannelId, { embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("ban")
      .setDescription("Ban a user from the server")
      .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to ban").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for ban").setRequired(true)
      ),
    async execute(interaction, context) {
      const targetUser = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason", true);

      try {
        await interaction.guild.members.ban(targetUser.id, { reason });
      } catch (error) {
        await interaction.reply({
          content: "I do not have permission to ban that user.",
          ephemeral: true
        });
        return;
      }

      const embed = moderationEmbed({
        action: "Ban",
        moderator: interaction.user,
        target: targetUser,
        reason,
        color: Colors.Red
      });

      logInfo(
        `BAN | guild=${interaction.guildId} moderator=${interaction.user.id} target=${targetUser.id} reason=${reason}`
      );

      await interaction.reply({ embeds: [embed] });
      await sendToLogChannel(interaction.client, context.logChannelId, { embeds: [embed] });
    }
  }
];

module.exports = commands;
