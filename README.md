# Boon Bot (Node.js Discord Moderation Bot)

Boon Bot is a production-ready, beginner-friendly Discord bot built with Node.js and `discord.js` v14 using **slash commands**.

## Features

- `/hello` - Responds with `Hello {user}, I am Boon Bot 🤖`
- `/ping` - Basic latency check
- `/warn user reason` - Sends warning embed + logs action
- `/timeout user minutes reason` - Timeouts member with error handling
- `/ban user reason` - Bans member with error handling
- Console logging for all moderation actions
- Optional moderation log channel (`LOG_CHANNEL_ID`)

## Project Structure

```text
discoard bot/
├── src/
│   ├── index.js
│   ├── deploy-commands.js
│   ├── config.js
│   ├── logger.js
│   ├── commands/
│   │   ├── index.js
│   │   ├── general.js
│   │   └── moderation.js
│   └── utils/
│       ├── embed.js
│       └── log-channel.js
├── .env.example
├── package.json
└── README.md
```

## Requirements

- Node.js 20+
- A Discord application from [Discord Developer Portal](https://discord.com/developers/applications)

## Setup (Local)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env`:
   ```bash
   cp .env.example .env
   ```

3. Fill `.env` values:
   - `DISCORD_TOKEN`: bot token
   - `CLIENT_ID`: Discord application ID
   - `GUILD_ID` (optional): for fast guild-only command registration
   - `LOG_CHANNEL_ID` (optional): moderation logs channel ID

4. Deploy slash commands:
   ```bash
   npm run deploy:commands
   ```

5. Start bot:
   ```bash
   npm start
   ```

## Discord Setup Notes

- In Discord Developer Portal:
  - Enable **Server Members Intent**
- Bot permissions in your server:
  - `Moderate Members`
  - `Ban Members`
  - `Send Messages`
  - `Embed Links`
- Invite with scopes:
  - `bot`
  - `applications.commands`

## Deploy to Hosting

For Railway/Render/VPS:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `DISCORD_TOKEN`, `CLIENT_ID`, optional `GUILD_ID`, optional `LOG_CHANNEL_ID`

Use a worker/background service type so the bot stays online 24/7.
