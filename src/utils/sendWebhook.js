const { WebhookClient, EmbedBuilder } = require("discord.js");
const config = require("../config/config.js"); // path adjust if needed
module.exports = async (data) => {

  const url = config.NOPWEB;

  if (!url) return;

  const webhook = new WebhookClient({ url });

  const embed = new EmbedBuilder()

    .setColor("#2b2d31")

    .setAuthor({ name: "🔐 NoPrefix System Logs" })

    .setDescription(data.desc || "No info")

    .addFields(data.fields || [])

    .setFooter({ text: "Pudding Premium • Secure System" })

    .setTimestamp();

  webhook.send({ embeds: [embed] }).catch(() => {});

};