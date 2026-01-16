const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  WebhookClient
} = require("discord.js");

const noPrefix = require("../../models/NoPrefixSchema.js");
const config = require("../../config/config.js");

// 🔥 Webhook Logs
const LOG_WEBHOOK = new WebhookClient({ url: config.NOPWEB });

// 📌 Support Server (Edit if you want)
const SUPPORT_SERVER_ID = "1443190181371973795";
const SUPPORT_INVITE = "https://discord.gg/2zKVQpmFc7";

module.exports = (client) => {

  // ================== AUTO CHECK SYSTEM ==================
  setInterval(async () => {
    const users = await noPrefix.find({});
    const now = Date.now();

    for (const data of users) {
      if (!data.expireAt) continue;

      const timeLeft = data.expireAt - now;

      // ⚠️ 10 Hours Before Expire Notify
      if (timeLeft <= 36000000 && timeLeft > 0 && !data.notified) {
        data.notified = true;
        await data.save();

        const user = await client.users.fetch(data.userId).catch(() => null);
        if (user) {
          const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("⚠️ NoPrefix Expiring Soon")
            .setDescription(
              `Your **NoPrefix Premium** will expire in **${formatDuration(timeLeft)}**.\n\n` +
              `Renew now to continue using commands **without prefix**.`
            )
            .setFooter({ text: "Excel Music Premium" })
            .setTimestamp();

          user.send({ embeds: [embed] }).catch(() => {});
        }

        sendLog("Expiring Soon", data.userId, data.expireAt);
      }

      // ❌ Expired
      if (timeLeft <= 0) {
        await noPrefix.deleteOne({ userId: data.userId });

        const user = await client.users.fetch(data.userId).catch(() => null);
        if (user) {
          const embed = new EmbedBuilder()
            .setColor("#ED4245")
            .setTitle("❌ NoPrefix Expired")
            .setDescription(
              `Your **NoPrefix Premium** has expired.\n\n` +
              `Join support to renew and continue premium access.`
            )
            .setFooter({ text: "Excel Music Premium" })
            .setTimestamp();

          user.send({ embeds: [embed] }).catch(() => {});
        }

        sendLog("Expired", data.userId, data.expireAt);
      }
    }
  }, 3600000); // every 1 hour


  // ================== MESSAGE CHECK ==================
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const data = await noPrefix.findOne({ userId: message.author.id });
    if (!data) return;

    if (data.expireAt && Date.now() > data.expireAt) {

      const embed = new EmbedBuilder()
        .setColor("#ED4245")
        .setTitle("❌ NoPrefix Expired")
        .setDescription("Your **NoPrefix Premium** has expired. Renew to continue using it.")
        .setFooter({ text: "pudding Premium" });

      let components = [];
      if (!message.guild || message.guild.id !== SUPPORT_SERVER_ID) {
        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Renew NoPrefix")
          .setURL(SUPPORT_INVITE);

        components = [new ActionRowBuilder().addComponents(button)];
      }

      message.channel.send({ embeds: [embed], components }).catch(() => {});
    }
  });


  // ================== LOG SYSTEM ==================
  function sendLog(type, userId, expireAt) {
    const embed = new EmbedBuilder()
      .setColor(type === "Expired" ? "#ED4245" : "#FEE75C")
      .setTitle(`🔐 NoPrefix ${type}`)
      .addFields(
        { name: "👤 User", value: `<@${userId}> (${userId})`, inline: false },
        {
          name: "⏳ Expire At",
          value: expireAt
            ? `<t:${Math.floor(expireAt / 1000)}:F>`
            : "Lifetime",
          inline: true
        },
        { name: "📅 Logged", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
      )
      .setFooter({ text: "Pudding • Secure Premium System" })
      .setTimestamp();

    LOG_WEBHOOK.send({
      content: `<@${userId}>`,
      embeds: [embed],
    }).catch(() => {});
  }


  // ================== TIME FORMAT ==================
  function formatDuration(ms) {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
};