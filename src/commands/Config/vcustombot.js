const { EmbedBuilder } = require("discord.js");
const CustomBot = require("../../models/CustomBotSchema");
const { isPremium } = require("../../utils/premium");
const log = require("../../utils/premiumLogger");

module.exports = {
  name: "vcustombot",

  run: async (client, message, args) => {
    const guildId = message.guild.id;

    let data = await CustomBot.findOne({ guildId });
    if (!data) data = await CustomBot.create({ guildId });

    // Panel
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor("#0b0d10")
        .setTitle("🖤 Pudding Custom Bot")
        .setDescription(`
🖼 Avatar: ${data.avatar ? "Custom" : "Default"}
🖼 Banner: ${data.banner ? "Custom" : "Default"}
📝 Bio: ${data.bio ? "Custom" : "Default"}
🏷 Nickname: ${data.nickname ? "Custom" : "Default"}

**Commands**
\`vcustombot avatar\`
\`vcustombot banner\`
\`vcustombot bio <text>\`
\`vcustombot name <nickname>\`
`)
        .setFooter({ text: "Pudding Premium" });

      return message.reply({ embeds: [embed] });
    }

    // Premium check
    const premium = await isPremium(guildId);
    if (!premium) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#0b0d10")
            .setTitle("🔒 Premium Feature")
            .setDescription("This feature is only available for **Pudding Premium** 💎\nUse `vpro` to upgrade.")
        ]
      });
    }

    // AVATAR
    if (args[0] === "avatar") {
      const img = message.attachments.first()?.url;
      if (!img) return message.reply("🖼 Send an image!");

      try {
        await client.user.setAvatar(img);
        await CustomBot.updateOne({ guildId }, { avatar: img });
        await log(client, `Avatar changed in **${message.guild.name}** by **${message.author.tag}**`);

        return message.reply("✅ **Pudding avatar updated!**");
      } catch (e) {
        console.error(e);
        return message.reply("❌ Avatar failed (rate-limit or image too big).");
      }
    }

    // BANNER
    if (args[0] === "banner") {
      const img = message.attachments.first()?.url;
      if (!img) return message.reply("🖼 Send an image!");

      try {
        await client.user.setBanner(img);
        await CustomBot.updateOne({ guildId }, { banner: img });
        await log(client, `Banner changed in **${message.guild.name}** by **${message.author.tag}**`);

        return message.reply("✅ **Pudding banner updated!**");
      } catch (e) {
        console.error(e);
        return message.reply("❌ Banner failed (rate-limit or image too big).");
      }
    }

    // BIO
    if (args[0] === "bio") {
      const bio = args.slice(1).join(" ");
      if (!bio) return message.reply("Give bio text!");

      await client.user.setActivity(bio);
      await CustomBot.updateOne({ guildId }, { bio });
      await log(client, `Bio changed in **${message.guild.name}** by **${message.author.tag}**`);

      return message.reply("✅ **Pudding bio updated!**");
    }

    // NAME
    if (args[0] === "name") {
      const name = args.slice(1).join(" ");
      if (!name) return message.reply("Give nickname!");

      await message.guild.members.me.setNickname(name).catch(() => {});
      await CustomBot.updateOne({ guildId }, { nickname: name });
      await log(client, `Nickname changed in **${message.guild.name}** by **${message.author.tag}**`);

      return message.reply("✅ **Pudding nickname updated!**");
    }
  }
};