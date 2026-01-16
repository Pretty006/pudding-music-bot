const { EmbedBuilder } = require("discord.js");
const crypto = require("crypto");
const noPrefix = require("../../models/NoPrefixSchema.js");
const sendWebhook = require("../../utils/sendWebhook");
const OWNERS = ["1085459608707014706", "1379911892037800128"];

module.exports = {
  name: "npg",
  owner: true,
  run: async (client, message, args) => {
if (!OWNERS.includes(message.author.id)) {
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setDescription("<:no:1447588569693687903> Only Bot Owner can generate NoPrefix Keys!");

    return message.reply({ embeds: [embed] });
  }
      
    let type = args[0];
    if (!type) type = "30d";

    let expireTime = null;
    if (type !== "permanent") {
      const days = parseInt(type.replace("d", ""));
      expireTime = Date.now() + days * 24 * 60 * 60 * 1000;
    }

    const key = crypto.randomBytes(10).toString("hex");

    await noPrefix.create({
      key,
      userId: null,
      expireAt: expireTime,
      permanent: !expireTime
    });

    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("✅ Premium Key Generated")
          .setDescription(`**Key:** \`${key}\`\nType: **${expireTime ? type : "Lifetime"}**`)
      ]
    });
  }
};