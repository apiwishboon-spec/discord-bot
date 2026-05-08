const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  Colors
} = require("discord.js");
const { moderationEmbed } = require("../utils/embed");
const { sendToLogChannel } = require("../utils/log-channel");
const { logInfo } = require("../logger");

const warningStore = new Map();

function warningKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

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

      const key = warningKey(interaction.guildId, target.id);
      const warnings = warningStore.get(key) || [];
      warnings.push({
        reason,
        moderatorTag: interaction.user.tag,
        at: new Date().toISOString()
      });
      warningStore.set(key, warnings);

      await interaction.reply({ embeds: [embed] });
      await sendToLogChannel(interaction.client, context.logChannelId, { embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("warnings")
      .setDescription("View warning history for a user")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to inspect").setRequired(true)
      ),
    async execute(interaction) {
      const targetUser = interaction.options.getUser("user", true);
      const key = warningKey(interaction.guildId, targetUser.id);
      const warnings = warningStore.get(key) || [];

      if (warnings.length === 0) {
        await interaction.reply({
          content: `${targetUser.tag} has no warnings.`,
          ephemeral: true
        });
        return;
      }

      const lines = warnings
        .slice(-10)
        .map(
          (entry, index) =>
            `${index + 1}. ${entry.reason} (by ${entry.moderatorTag} at ${entry.at})`
        );

      await interaction.reply({
        content: `Warnings for ${targetUser.tag}:\n${lines.join("\n")}`,
        ephemeral: true
      });
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
      .setName("untimeout")
      .setDescription("Remove timeout from a user")
      .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to remove timeout from").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for removing timeout").setRequired(true)
      ),
    async execute(interaction, context) {
      const targetUser = interaction.options.getUser("user", true);
      const targetMember = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason", true);

      if (!targetMember) {
        await interaction.reply({
          content: "I could not find that member in this server.",
          ephemeral: true
        });
        return;
      }

      try {
        await targetMember.timeout(null, reason);
      } catch (error) {
        await interaction.reply({
          content: "I do not have permission to remove timeout for that user.",
          ephemeral: true
        });
        return;
      }

      const embed = moderationEmbed({
        action: "Untimeout",
        moderator: interaction.user,
        target: targetUser,
        reason,
        color: Colors.Green
      });

      logInfo(
        `UNTIMEOUT | guild=${interaction.guildId} moderator=${interaction.user.id} target=${targetUser.id} reason=${reason}`
      );

      await interaction.reply({ embeds: [embed] });
      await sendToLogChannel(interaction.client, context.logChannelId, { embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName("kick")
      .setDescription("Kick a user from the server")
      .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
      .addUserOption((option) =>
        option.setName("user").setDescription("User to kick").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for kick").setRequired(true)
      ),
    async execute(interaction, context) {
      const targetUser = interaction.options.getUser("user", true);
      const targetMember = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason", true);

      if (!targetMember) {
        await interaction.reply({
          content: "I could not find that member in this server.",
          ephemeral: true
        });
        return;
      }

      try {
        await targetMember.kick(reason);
      } catch (error) {
        await interaction.reply({
          content: "I do not have permission to kick that user.",
          ephemeral: true
        });
        return;
      }

      const embed = moderationEmbed({
        action: "Kick",
        moderator: interaction.user,
        target: targetUser,
        reason,
        color: Colors.Blurple
      });

      logInfo(
        `KICK | guild=${interaction.guildId} moderator=${interaction.user.id} target=${targetUser.id} reason=${reason}`
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
  },
  {
    data: new SlashCommandBuilder()
      .setName("purge")
      .setDescription("Delete multiple recent messages")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("How many messages to delete (1-100)")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100)
      ),
    async execute(interaction) {
      const amount = interaction.options.getInteger("amount", true);

      try {
        const deleted = await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({
          content: `Deleted ${deleted.size} message(s).`,
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          content: "Failed to purge messages. I may be missing permissions.",
          ephemeral: true
        });
      }
    }
  }
];

module.exports = commands;
