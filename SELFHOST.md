# Self-Hosting the Mewdeko Dashboard

This guide covers running the Mewdeko Dashboard alongside your own Mewdeko bot instance. The dashboard is a SvelteKit app that connects to the bot's HTTP API.

## Prerequisites

- A running Mewdeko bot instance with `IsApiEnabled: true` in `credentials.json`
- Node.js 20+ and npm
- Redis (shared with the bot, or a separate instance)
- A Discord application with OAuth2 configured

## Step 1: Configure the Bot

The dashboard communicates with the bot API using a shared API key and JWT secret. In the bot's `credentials.json`, set:

```json
{
  "IsApiEnabled": true,
  "ApiPort": 5001,
  "ApiKey": "generate-a-secure-random-string",
  "JwtSecret": "generate-a-different-secure-random-string"
}
```

Generate secrets with:
```bash
openssl rand -hex 32
```

Restart the bot after changing credentials.

## Step 2: Configure Discord OAuth2

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and open your bot's application.
2. Navigate to **OAuth2 > General**.
3. Under **Redirects**, add your dashboard callback URL:
   - Local: `http://localhost:5173/api/discord/callback`
   - Production: `https://yourdomain.com/api/discord/callback`
4. Copy the **Client ID** and **Client Secret**.

## Step 3: Configure the Dashboard

Copy the example environment file and fill in your values:

```bash
cd MewdekoDash/mewdash
cp .env.example .env
```

Edit `.env`:

```env
# Discord OAuth (from Step 2)
DISCORD_CLIENT_ID="your_client_id"
DISCORD_CLIENT_SECRET="your_client_secret"
DISCORD_REDIRECT_URI="http://localhost:5173/api/discord/callback"

# Session encryption (generate with: openssl rand -base64 32)
COOKIE_ENCRYPTION_PASSWORD="your-secure-random-string"

# Bot API connection (must match credentials.json)
PUBLIC_MEWDEKO_API_URL="http://localhost:5001/botapi"
MEWDEKO_API_KEY="your_api_key_from_credentials_json"

# JWT secret (must exactly match JwtSecret in credentials.json)
BOT_JWT_SECRET="your_jwt_secret_from_credentials_json"

# Redis
USE_REDIS=true
REDIS_URL="127.0.0.1"
REDIS_KEY="your_redis_key_prefix"
```

The `BOT_JWT_SECRET` and `MEWDEKO_API_KEY` values must exactly match what is in the bot's `credentials.json` or the dashboard will fail to authenticate.

## Step 4: Install and Run

### Development

```bash
cd MewdekoDash/mewdash
npm install
npm run dev
```

Dashboard is available at `http://localhost:5173`.

### Production

```bash
cd MewdekoDash/mewdash
npm install
npm run build
node build/index.js
```

Dashboard runs on port 3000 by default. Set `PORT=xxxx` in the environment to change it.

#### Running as a systemd service

```ini
[Unit]
Description=Mewdeko Dashboard
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/MewdekoDash/mewdash
ExecStart=/usr/bin/node build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/path/to/MewdekoDash/mewdash/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable mewdeko-dashboard
sudo systemctl start mewdeko-dashboard
```

## Step 5: Reverse Proxy (Production)

The dashboard must be served over HTTPS in production for Discord OAuth to work. Example nginx config:

```nginx
server {
    listen 443 ssl;
    server_name dashboard.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Update `DISCORD_REDIRECT_URI` in `.env` to match your public domain, and add it to the redirect list in the Discord Developer Portal.

## Docker

If you prefer Docker, see `DOCKER.md` in the repository root. The Docker setup handles everything including the dashboard via:

```bash
docker-compose --profile dashboard up -d
```

## Troubleshooting

**"Failed to connect to bot API"**
- Confirm `IsApiEnabled: true` and `ApiPort` match in `credentials.json`
- Check `PUBLIC_MEWDEKO_API_URL` points to the correct host and port
- Verify the bot is running and the API port is not blocked by a firewall

**"Unauthorized" when logging in**
- `MEWDEKO_API_KEY` in `.env` must exactly match `ApiKey` in `credentials.json`
- `BOT_JWT_SECRET` in `.env` must exactly match `JwtSecret` in `credentials.json`

**OAuth redirect errors**
- The `DISCORD_REDIRECT_URI` in `.env` must exactly match one of the redirect URLs registered in the Discord Developer Portal (including protocol and trailing slashes)

**Session not persisting**
- Check Redis is running and `REDIS_URL` is correct
- `REDIS_KEY` should be a short unique prefix (e.g. `mewdeko`) to avoid collisions

## Getting Help

- Join the [Discord Server](https://discord.gg/nh9WWPvnde) for community support
- Open an issue on [GitHub](https://github.com/SylveonDeko/Mewdeko/issues) for bugs
