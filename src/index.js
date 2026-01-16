require("dotenv").config();
const config = require("./config/config.js");
const MainClient = require("./structure/client");
const topgg = require("./topgg");

const client = new MainClient();

(async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.ConnectMongo();

    console.log("📦 Loading Events...");
    await client.loadEvents();

    console.log("⚡ Loading Slash Commands...");
    await client.loadSlashCommands();

    console.log("🤖 Logging in to Discord...");
    await client.login(config.token);
    console.log(`✅ Logged in as ${client.user.tag}`);

    topgg(client);

  } catch (err) {
    console.error("❌ Startup error:", err);
  }
})();

module.exports = client;