"""Configuration helpers for Boon Bot."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    """Runtime configuration loaded from environment variables."""

    discord_token: str
    log_channel_id: Optional[int]


def _parse_optional_int(raw_value: Optional[str]) -> Optional[int]:
    if raw_value is None or raw_value.strip() == "":
        return None
    try:
        return int(raw_value)
    except ValueError:
        raise ValueError("LOG_CHANNEL_ID must be an integer if provided.") from None


def load_settings() -> Settings:
    """Load and validate settings from the environment."""
    load_dotenv()

    token = os.getenv("DISCORD_TOKEN")
    if not token:
        raise ValueError("DISCORD_TOKEN is required. Add it to your .env file.")

    log_channel_id = _parse_optional_int(os.getenv("LOG_CHANNEL_ID"))
    return Settings(discord_token=token, log_channel_id=log_channel_id)
