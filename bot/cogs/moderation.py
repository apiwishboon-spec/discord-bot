"""Moderation slash commands for Boon Bot."""

from __future__ import annotations

import datetime as dt
import logging
from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands

from bot.utils import moderation_embed

LOGGER = logging.getLogger("boonbot.moderation")


class ModerationCog(commands.Cog):
    """Guild moderation actions using slash commands."""

    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot

    async def _send_log_embed(self, embed: discord.Embed) -> None:
        """Optionally forward moderation logs to a configured channel."""
        log_channel_id: Optional[int] = getattr(self.bot, "log_channel_id", None)
        if not log_channel_id:
            return

        channel = self.bot.get_channel(log_channel_id)
        if channel is None:
            # Fetch in case channel is not in cache yet.
            channel = await self.bot.fetch_channel(log_channel_id)

        if isinstance(channel, discord.abc.Messageable):
            await channel.send(embed=embed)

    @app_commands.command(name="warn", description="Warn a user with a reason.")
    @app_commands.checks.has_permissions(moderate_members=True)
    @app_commands.describe(user="User to warn", reason="Reason for warning")
    async def warn(
        self,
        interaction: discord.Interaction,
        user: discord.Member,
        reason: str,
    ) -> None:
        embed = moderation_embed(
            action="Warn",
            moderator=interaction.user,
            target=user,
            reason=reason,
            color=discord.Color.orange(),
        )

        LOGGER.info(
            "WARN | guild=%s moderator=%s target=%s reason=%s",
            interaction.guild_id,
            interaction.user.id,
            user.id,
            reason,
        )

        await interaction.response.send_message(embed=embed)
        await self._send_log_embed(embed)

    @app_commands.command(name="timeout", description="Timeout a user for N minutes.")
    @app_commands.checks.has_permissions(moderate_members=True)
    @app_commands.describe(
        user="User to timeout",
        minutes="Timeout duration in minutes (1-10080)",
        reason="Reason for timeout",
    )
    async def timeout(
        self,
        interaction: discord.Interaction,
        user: discord.Member,
        minutes: app_commands.Range[int, 1, 10080],
        reason: str,
    ) -> None:
        until = dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=minutes)

        try:
            await user.edit(timed_out_until=until, reason=reason)
        except discord.Forbidden:
            await interaction.response.send_message(
                "I do not have permission to timeout that user.",
                ephemeral=True,
            )
            return
        except discord.HTTPException:
            await interaction.response.send_message(
                "Failed to timeout the user due to a Discord API error.",
                ephemeral=True,
            )
            return

        embed = moderation_embed(
            action="Timeout",
            moderator=interaction.user,
            target=user,
            reason=reason,
            color=discord.Color.yellow(),
            duration_minutes=minutes,
        )

        LOGGER.info(
            "TIMEOUT | guild=%s moderator=%s target=%s minutes=%s reason=%s",
            interaction.guild_id,
            interaction.user.id,
            user.id,
            minutes,
            reason,
        )

        await interaction.response.send_message(embed=embed)
        await self._send_log_embed(embed)

    @app_commands.command(name="ban", description="Ban a user from the server.")
    @app_commands.checks.has_permissions(ban_members=True)
    @app_commands.describe(user="User to ban", reason="Reason for ban")
    async def ban(
        self,
        interaction: discord.Interaction,
        user: discord.Member,
        reason: str,
    ) -> None:
        try:
            await interaction.guild.ban(user, reason=reason)
        except discord.Forbidden:
            await interaction.response.send_message(
                "I do not have permission to ban that user.",
                ephemeral=True,
            )
            return
        except discord.HTTPException:
            await interaction.response.send_message(
                "Failed to ban the user due to a Discord API error.",
                ephemeral=True,
            )
            return

        embed = moderation_embed(
            action="Ban",
            moderator=interaction.user,
            target=user,
            reason=reason,
            color=discord.Color.red(),
        )

        LOGGER.info(
            "BAN | guild=%s moderator=%s target=%s reason=%s",
            interaction.guild_id,
            interaction.user.id,
            user.id,
            reason,
        )

        await interaction.response.send_message(embed=embed)
        await self._send_log_embed(embed)

    @warn.error
    @timeout.error
    @ban.error
    async def moderation_command_error(
        self,
        interaction: discord.Interaction,
        error: app_commands.AppCommandError,
    ) -> None:
        """Handle permission and command-level errors cleanly."""
        if isinstance(error, app_commands.MissingPermissions):
            message = "You do not have permission to use this command."
        else:
            message = "Something went wrong while running this command."
            LOGGER.exception("Unhandled moderation command error: %s", error)

        if interaction.response.is_done():
            await interaction.followup.send(message, ephemeral=True)
        else:
            await interaction.response.send_message(message, ephemeral=True)


async def setup(bot: commands.Bot) -> None:
    """Called by discord.py when loading this extension."""
    await bot.add_cog(ModerationCog(bot))
