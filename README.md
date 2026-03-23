# Google Ads URL Guard

> Google Ads Script for SMBs — Detect and handle broken ad URLs (4xx/5xx errors).

## What it does

This script iterates over all enabled ads in your account, fetches each final URL, and checks the HTTP response code. Ads returning 4xx or 5xx errors are labeled and optionally paused. An email report is sent listing all broken URLs found. A per-run URL limit prevents hitting the UrlFetchApp quota.

## Setup

1. Open Google Ads > Tools > Scripts
2. Create a new script and paste the code from `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` block at the top
4. Authorize and run a preview first
5. Schedule: **Daily**

## CONFIG reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `TEST_MODE` | `true` | When true, logs issues without pausing/labeling |
| `EMAIL` | `contact@yourdomain.com` | Email address for broken URL alerts |
| `PAUSE_ADS_ON_ERROR` | `true` | Pause ads with broken URLs |
| `ERROR_LABEL` | `Broken_URL` | Label applied to flagged ads |
| `MAX_URLS_PER_RUN` | `200` | Maximum URLs checked per execution (quota safety) |
| `TIMEOUT_MS` | `10000` | Fetch timeout in milliseconds |

## How it works

1. Selects all enabled ads (limited to `MAX_URLS_PER_RUN`)
2. Fetches each ad's final URL with `muteHttpExceptions: true`
3. If HTTP status >= 400 or fetch fails: labels the ad and optionally pauses it
4. Sends an email summary of all broken URLs

## Requirements

- Google Ads account
- Google Ads Scripts access

## License

MIT — Thibault Fayol Consulting
