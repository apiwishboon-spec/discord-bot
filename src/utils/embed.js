const { EmbedBuilder } = require("discord.js");

function moderationEmbed({ action, moderator, target, reason, color, durationMinutes }) {
  const embed = new EmbedBuilder()
    .setTitle(`Moderation Action: ${action}`)
    .setColor(color)
    .setTimestamp()
    .addFields(
      { name: "Target", value: `${target.tag} (\`${target.id}\`)`, inline: false },
      { name: "Moderator", value: `${moderator.tag} (\`${moderator.id}\`)`, inline: false },
      { name: "Reason", value: reason || "No reason provided.", inline: false }
    );

  if (durationMinutes) {
    embed.addFields({
      name: "Duration",
      value: `${durationMinutes} minute(s)`,
      inline: false
    });
  }

  return embed;
}

module.exports = {
  moderationEmbed
};
