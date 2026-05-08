# Boon Bot (Discord Moderation Bot)

Boon Bot is a production-ready, beginner-friendly Discord bot built with Python and `discord.py` 2.x using **slash commands** (`app_commands`).

## Features

- `/hello` - Responds with a friendly greeting.
- `/ping` - Basic latency check.
- `/warn user reason` - Sends a warning embed and logs action.
- `/timeout user minutes reason` - Timeouts a member with permission/error handling.
- `/ban user reason` - Bans a member with permission/error handling.
- Console logging for moderation actions.
- Optional moderation log channel forwarding via environment config.

## Project Structure

```text
discoard bot/
├── bot/
│   ├── __init__.py
│   ├── config.py
│   ├── utils.py
│   └── cogs/
│       ├── __init__.py
│       ├── general.py
│       └── moderation.py
├── .env.example
├── main.py
└── requirements.txt
```

## Requirements

- Python 3.10+
- A Discord bot application created at [Discord Developer Portal](https://discord.com/developers/applications)

## Setup (Local)

1. Create and activate a virtual environment:
   - macOS/Linux:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
   - Windows (PowerShell):
     ```powershell
     py -m venv .venv
     .venv\Scripts\Activate.ps1
     ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` from example:
   ```bash
   cp .env.example .env
   ```

4. Fill `.env`:
   - `DISCORD_TOKEN`: your bot token
   - `LOG_CHANNEL_ID` (optional): channel ID for moderation logs

5. Run bot:
   ```bash
   python main.py
   ```

## Discord Setup Notes

- In the Discord Developer Portal:
  - Enable **Server Members Intent** (required for moderation member actions).
- Bot needs permissions in your server:
  - `Moderate Members`
  - `Ban Members`
  - `Send Messages`
  - `Embed Links`
- Invite bot with `applications.commands` scope so slash commands are available.

## Deployment (Simple Guide)

You can deploy this on platforms like Railway, Render, or a VPS:

1. Push project to GitHub.
2. Create a new service on your hosting platform.
3. Set environment variables:
   - `DISCORD_TOKEN`
   - `LOG_CHANNEL_ID` (optional)
4. Start command:
   ```bash
   python main.py
   ```

For reliability, use a host that supports long-running worker/background services.
