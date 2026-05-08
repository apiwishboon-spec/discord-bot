"""Utility functions for Boon Bot."""

from __future__ import annotations

import datetime as dt

import discord


def moderation_embed(
    action: str,
    moderator: discord.abc.User,
    target: discord.abc.User,
    reason: str,
    color: discord.Color,
    duration_minutes: int | None = None,
) -> discord.Embed:
    """Build a consistent moderation embed."""
    embed = discord.Embed(
        title=f"Moderation Action: {action}",
        color=color,
        timestamp=dt.datetime.now(dt.timezone.utc),
    )
    embed.add_field(name="Target", value=f"{target} (`{target.id}`)", inline=False)
    embed.add_field(name="Moderator", value=f"{moderator} (`{moderator.id}`)", inline=False)
    embed.add_field(name="Reason", value=reason or "No reason provided.", inline=False)

    if duration_minutes is not None:
        embed.add_field(name="Duration", value=f"{duration_minutes} minute(s)", inline=False)

    return embed
