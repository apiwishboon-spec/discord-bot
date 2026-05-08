"""General slash commands for Boon Bot."""

from __future__ import annotations

import discord
from discord import app_commands
from discord.ext import commands


class GeneralCog(commands.Cog):
    """Non-moderation commands."""

    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot

    @app_commands.command(name="hello", description="Say hello to Boon Bot.")
    async def hello(self, interaction: discord.Interaction) -> None:
        await interaction.response.send_message(
            f"Hello {interaction.user.mention}, I am Boon Bot 🤖"
        )

    @app_commands.command(name="ping", description="Check if the bot is responsive.")
    async def ping(self, interaction: discord.Interaction) -> None:
        latency_ms = round(self.bot.latency * 1000)
        await interaction.response.send_message(f"Pong! `{latency_ms}ms`")


async def setup(bot: commands.Bot) -> None:
    """Called by discord.py when loading this extension."""
    await bot.add_cog(GeneralCog(bot))
