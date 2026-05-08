"""Entry point for Boon Bot."""

from __future__ import annotations

import asyncio
import logging

import discord
from discord.ext import commands

from bot.config import load_settings


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )


class BoonBot(commands.Bot):
    """Discord bot with slash commands and moderation tools."""

    def __init__(self, log_channel_id: int | None) -> None:
        intents = discord.Intents.default()
        intents.members = True  # Needed for moderation actions on members.

        super().__init__(command_prefix=commands.when_mentioned, intents=intents)
        self.log_channel_id = log_channel_id

    async def setup_hook(self) -> None:
        # Load cogs/extensions.
        await self.load_extension("bot.cogs.general")
        await self.load_extension("bot.cogs.moderation")

        # Sync slash commands globally.
        synced = await self.tree.sync()
        logging.getLogger("boonbot").info("Synced %s app command(s).", len(synced))

    async def on_ready(self) -> None:
        logging.getLogger("boonbot").info("Logged in as %s (%s)", self.user, self.user.id)


async def main() -> None:
    setup_logging()
    settings = load_settings()

    bot = BoonBot(log_channel_id=settings.log_channel_id)
    await bot.start(settings.discord_token)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
