# YouTube MP3 Telegram Bot

This is a Telegram bot that allows you to download YouTube videos as MP3 files and automatically deletes the files after 2 minutes.

## Features

- Download YouTube videos as MP3 files
- Automatically delete files after 2 minutes
- Input validation for YouTube URLs
- Error handling for invalid URLs and download failures
- Rate limiting to prevent abuse
- Configurable file size limit
- Configurable rate limit
- Configurable delete time

## Configuration

The bot uses a `.env` file for configuration. Here are the available configuration options:

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `MAX_FILE_SIZE`: The maximum file size in MB (default: 100)
- `MAX_DOWNLOADS_PER_MINUTE`: The maximum number of downloads per minute (default: 5)
- `DELETE_AFTER_MINUTES`: The number of minutes to wait before deleting the file (default: 2)

## Installation

1. Clone the repository: `git clone https://github.com/shaweesh/telegram-youtube-bot.git`
2. Navigate to the project directory: `cd telegram-bot`
3. Install dependencies: `npm install`
4. Create a `.env` file with your configuration

- Example:

```bash
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
MAX_FILE_SIZE=100
MAX_DOWNLOADS_PER_MINUTE=5
DELETE_AFTER_MINUTES=2
```

5. Start the bot: `npm start`

## Usage

1. Send a YouTube URL to the bot
2. The bot will download the video as an MP3 file
3. The bot will send the MP3 file to you
4. The bot will automatically delete the file after 2 minutes

## Dependencies

- node-telegram-bot-api: ^0.65.1
- ytdl-core: ^4.11.5
- dotenv: ^16.4.5

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
