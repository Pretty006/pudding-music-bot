const { green, red, cyan } = require("chalk");
const { ActivityType } = require("discord.js");
const reconnectAuto = require("../../models/reconnect.js");
const wait = require("wait");
const cfonts = require("cfonts");
const CustomBot = require("../../models/CustomBotSchema");

function logBox(title, messages, color = cyan) {
  const lines = Array.isArray(messages) ? messages : [messages];
  const width = Math.max(title.length, ...lines.map(l => l.length)) + 6;

  const top = "╔" + "═".repeat(width - 2) + "╗";
  const bottom = "╚" + "═".repeat(width - 2) + "╝";
  const header = `║ ${title.padEnd(width - 4)} ║`;

  console.log(color(top));
  console.log(color(header));
  for (const msg of lines) {
    console.log(color(`║ ${msg.padEnd(width - 4)} ║`));
  }
  console.log(color(bottom));
}

function bigAsciiName(user) {
  const botName = user.username;
  cfonts.say(botName, {
    font: "block",
    align: "center",
    colors: ["black"],
    background: "transparent",
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: "0"
  });
}

module.exports = async (client) => {
  client.on("ready", async () => {
    console.log("DEBUG USER:", client.user?.id, client.user?.username);

    if (!client.user) {
      logBox("❌ FATAL ERROR", ["client.user is undefined. Bot not ready!"], red);
      return;
    }

    await wait(10000);

    // Reconnect queues
    let maindata = [];
    try {
      maindata = await reconnectAuto.find();
    } catch (err) {
      logBox("Reconnect ERROR", [`Failed to load reconnect data: ${err}`], red);
    }

    logBox("< Reconnect", [`Found ${maindata.length} queue(s). Resuming...`], green);

    for (const data of maindata) {
      try {
        const text = await client.channels.fetch(data.TextId).catch(() => null);
        const guild = await client.guilds.fetch(data.GuildId).catch(() => null);
        const voice = await client.channels.fetch(data.VoiceId).catch(() => null);
        if (!guild || !text || !voice) continue;

        await client.manager.createPlayer({
          guildId: guild.id,
          textId: text.id,
          voiceId: voice.id,
          volume: 100,
          deaf: true,
          shardId: guild.shardId,
        });

        logBox("🎶 Voice Connected", [
          `Guild: ${guild.name}`,
          `Text: #${text.name}`,
          `Voice: ${voice.name}`
        ], green);

      } catch (error) {
        logBox("🚨 Reconnect Failed", [`Guild ${data.GuildId}: ${error.message}`], red);
      }
    }

    // ASCII name
    bigAsciiName(client.user);

    // 🖤 Load Premium Custom Bot Look
    let premiumBio = null;
    try {
      const all = await CustomBot.find();
      for (const data of all) {
        if (data.avatar) client.user.setAvatar(data.avatar).catch(() => {});
        if (data.banner) client.user.setBanner(data.banner).catch(() => {});
        if (data.bio) premiumBio = data.bio;
      }
    } catch (e) {
      logBox("CustomBot ERROR", [e.message], red);
    }

    // Presence rotation
    const activities = [
      { name: "Pudding love❤ U", type: ActivityType.Playing },
      { name: `${client.config.prefix}help`, type: ActivityType.Playing },
      { name: `${client.config.prefix}play`, type: ActivityType.Playing },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()} users`, type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Playing }
    ];

    const statuses = ["dnd"];
    let activityIndex = 0;
    let statusIndex = 0;

    setInterval(async () => {
      try {
        const act = premiumBio
          ? { name: premiumBio, type: ActivityType.Playing }
          : activities[activityIndex];

        await client.user.setPresence({
          activities: [act],
          status: statuses[statusIndex],
        });

        activityIndex = (activityIndex + 1) % activities.length;
        statusIndex = (statusIndex + 1) % statuses.length;
      } catch (err) {
        logBox("⚠️ Presence Error", [err.message], red);
      }
    }, 20000);
  });
};