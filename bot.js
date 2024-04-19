require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const fs = require('fs');

const filePath = './temp/downloaded_files/';

// Create the temp folder if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.mkdirSync(filePath);
}

// Load configuration from .env file
const maxFileSize = process.env.MAX_FILE_SIZE * 1024 * 1024; // Convert MB to bytes
const maxDownloadsPerMinute = parseInt(process.env.MAX_DOWNLOADS_PER_MINUTE);
const deleteAfterMinutes = parseInt(process.env.DELETE_AFTER_MINUTES);

// Create the bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // Check if the message contains a YouTube URL
  const urlPattern = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (urlPattern.test(msg.text)) {
    const videoUrl = msg.text.match(urlPattern)[0];

    try {
      // Validate the URL
      if (!ytdl.validateURL(videoUrl)) {
        throw new Error('Invalid YouTube URL');
      }

      // Check if the file size is within the limit
      if (maxFileSize && (await ytdl.getInfo(videoUrl)).size > maxFileSize) {
        throw new Error(`File size is too large (max ${maxFileSize / (1024 * 1024)} MB)`);
      }

      // Check if the video can be downloaded in MP3 format
      if (!await ytdl.getInfo(videoUrl).then(info => info.formats.some(format => format.container === 'mp3'))) {
        throw new Error('Video cannot be downloaded in MP3 format');
      }

      // Check if the rate limit has been exceeded
      if (maxDownloadsPerMinute && Object.keys(bot.stats.byChat[chatId].messages).filter(messageId => messageId.startsWith('download_')).length >= maxDownloadsPerMinute) {
        throw new Error(`Rate limit of ${maxDownloadsPerMinute} downloads per minute has been exceeded`);
      }

      // Download the video as MP3
      const mp3Stream = ytdl(videoUrl, { format: 'mp3' });
      const mp3File = fs.createWriteStream(`${filePath}${videoUrl.split('/').pop()}.mp3`);

      mp3Stream.on('error', (error) => {
        console.error(`Error downloading MP3: ${error.message}`);
        bot.sendMessage(chatId, 'Error downloading the video.');
      });

      mp3File.on('error', (error) => {
        console.error(`Error writing MP3: ${error.message}`);
        bot.sendMessage(chatId, 'Error downloading the video.');
      });

      mp3Stream.pipe(mp3File);

      // Send a message to the user
      bot.sendMessage(chatId, `Downloading the video...`);

      // Wait for the file to download
      await new Promise((resolve) => mp3File.on('finish', resolve));

      // Send the file to the user
      bot.sendAudio(chatId, { source: `${filePath}${videoUrl.split('/').pop()}.mp3` });

      // Delete the file after the specified number of minutes
      setTimeout(() => {
        fs.unlinkSync(`${filePath}${videoUrl.split('/').pop()}.mp3`);
        bot.sendMessage(chatId, `File deleted.`);
      }, deleteAfterMinutes * 60 * 1000);

      // Update the rate limit
      bot.stats.byChat[chatId].messages[`download_${Date.now()}`] = { type: 'download', url: videoUrl };
    } catch (error) {
      console.error(`Error: ${error.message}`);
      bot.sendMessage(chatId, `Error: ${error.message}`);
    }
  }
});