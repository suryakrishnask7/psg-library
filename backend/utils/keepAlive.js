const https = require('https');
const http = require('http');

/**
 * Render Free Tier Keep-Alive Worker
 * Render puts free web services to sleep after 15 minutes of inactivity.
 * This worker automatically self-pings the /api/health endpoint every 14 minutes
 * using Render's automatically provided RENDER_EXTERNAL_URL (or SERVER_URL).
 */
const startKeepAliveCron = (intervalMinutes = 14) => {
  // Render automatically populates RENDER_EXTERNAL_URL (e.g. https://psg-library-api.onrender.com)
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

  if (!targetUrl) {
    console.log('ℹ️  Keep-Alive Cron: Standing by (will activate automatically when deployed on Render via RENDER_EXTERNAL_URL).');
    return;
  }

  const pingUrl = targetUrl.replace(/\/+$/, '') + '/api/health';
  const intervalMs = intervalMinutes * 60 * 1000; // 14 minutes

  console.log(`⏰ Render Keep-Alive Cron active: Pinging ${pingUrl} every ${intervalMinutes} minutes.`);

  // Self ping function
  const ping = () => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      client
        .get(pingUrl, (res) => {
          if (res.statusCode === 200) {
            console.log(`[Keep-Alive Cron ${new Date().toLocaleTimeString()}] ✅ Ping success (Status: 200) - Render kept awake`);
          } else {
            console.warn(`[Keep-Alive Cron] ⚠️ Ping returned status ${res.statusCode}`);
          }
        })
        .on('error', (err) => {
          console.error(`[Keep-Alive Cron Error] Failed to ping: ${err.message}`);
        });
    } catch (e) {
      console.error(`[Keep-Alive Cron Exception]:`, e.message);
    }
  };

  // Schedule interval
  setInterval(ping, intervalMs);

  // Optional first ping after 1 minute to test connectivity
  setTimeout(ping, 60 * 1000);
};

module.exports = startKeepAliveCron;
