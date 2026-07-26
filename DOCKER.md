# Mewdeko Dashboard Docker image

`sylveondeko/mewdash` runs the Mewdeko web dashboard. The image contains no Discord OAuth credentials, bot API key, JWT secret, or Redis password. Pass those values at runtime with an environment file.

## Tags

- `nightly`: newest successful build from `main`
- `sha-<commit>`: immutable build from a specific commit
- `latest` and a version tag: published for a versioned release

The image supports `linux/amd64` and `linux/arm64`.

## Required configuration

Create `dashboard.env` from [`mewdash/.env.example`](mewdash/.env.example). The following values are required for the dashboard and bot to communicate safely:

| Dashboard variable | Value |
| --- | --- |
| `DISCORD_CLIENT_ID` | Discord application client ID. |
| `DISCORD_CLIENT_SECRET` | Discord application client secret. |
| `DISCORD_REDIRECT_URI` | Exact callback registered in the Discord Developer Portal, such as `https://dashboard.example.com/api/discord/callback`. |
| `COOKIE_ENCRYPTION_PASSWORD` | Independent random secret used to encrypt browser OAuth cookies. |
| `PUBLIC_MEWDEKO_API_URL` | Bot API URL. Use `http://mewdeko:5001/botapi` when both services share a Compose network. |
| `MEWDEKO_API_KEY` | Must exactly equal bot `credentials.json` `ApiKey`. |
| `BOT_JWT_SECRET` | Must exactly equal bot `credentials.json` `JwtSecret`. |
| `USE_REDIS` | Set `true` to retain sessions and use live music updates. |
| `REDIS_URL` | Redis host, such as `redis` in Docker Compose. |
| `REDIS_KEY` | First ten characters of the Discord bot token. It scopes dashboard music events to that bot. |

Generate `COOKIE_ENCRYPTION_PASSWORD`, `ApiKey`, and `JwtSecret` independently with `openssl rand -hex 32`.

## Run the dashboard image

```bash
docker run -d \
  --name mewdash \
  --restart unless-stopped \
  --env-file ./dashboard.env \
  -p 3000:3000 \
  sylveondeko/mewdash:nightly
```

Open `http://localhost:3000`. In production, put the dashboard behind an HTTPS reverse proxy and add the same public callback URL to Discord OAuth2 > General > Redirects.

## Run bot and dashboard together

Use the ready-to-copy four-service Compose setup in the [Mewdeko Docker guide](https://github.com/SylveonDeko/Mewdeko/blob/main/DOCKER.md). It starts PostgreSQL, Redis, `sylveondeko/mewdeko`, and this image on one private network.

Do not publish the bot's port `5001` unless another trusted service needs direct API access. The dashboard can reach it internally through `http://mewdeko:5001/botapi`.
