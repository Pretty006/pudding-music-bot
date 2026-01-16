const express = require("express");
const { Webhook } = require("@top-gg/sdk");
const config = require("./config/config.js"); // agar topgg.js /src ke andar hai

module.exports = (client) => {
  const app = express();
  const webhook = new Webhook(config.dblToken);

  app.post("/topgg", webhook.listener(async (vote) => {
    try {
      const channel = client.channels.cache.get(config.voteChannel);
      if (!channel) return;

      const user = await client.users.fetch(vote.user).catch(() => null);
      const username = user ? user.username : "Someone";

      await channel.send({
        embeds: [
          {
            color: 0x000000,
            title: "🖤 New Vote",
            description: `**${username}** just voted for **${client.user.username}** on Top.gg`,
            footer: { text: "Thank you for your support ❤️" },
            timestamp: new Date()
          }
        ]
      });
    } catch (err) {
      console.log("Top.gg Error:", err);
    }
  }));

  app.listen(3000, () => {
    console.log("Top.gg webhook running on port 3000");
  });
};