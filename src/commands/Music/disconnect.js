const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "disconnect",
  aliases: ["dc", "leave"],
  description: "Disconnect the bot from the voice channel",
  botPermissions: ["SendMessages"],
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  premium: false,
  dj: true,

  run: async (client, message, args, prefix, player) => {
    try {
      // No Player Found
      if (!player) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: ` Disconnect Failed` })
              .setDescription(
                `Abhi koi **music player active nahi hai!**\n` +
                `Gaana chalane ke liye \`${prefix}play <song>\` use karo 🎶`
              )
              .setFooter({ text: "Pudding Music" })
              .setTimestamp()
          ]
        });
      }

      // Try delete last music embed (optional cleanup)
      try {
        const fetched = await message.channel.messages.fetch({ limit: 10 });
        const botMsg = fetched.find(
          (msg) =>
            msg.embeds.length > 0 &&
            msg.author?.id === client.user.id
        );
        if (botMsg) await botMsg.delete().catch(() => {});
      } catch {}

      await player.destroy();

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ffa2")
            .setAuthor({ name: " Disconnected" })
            .setDescription(
              `${client.user.username} voice channel se **disconnect ho gaya!**\n` +
              `Phir milte hain next vibes ke saath 🎵`
            )
            .setFooter({ text: `Requested by ${message.author.username}` })
            .setTimestamp()
        ]
      });

    } catch (err) {
      console.log(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0000")
            .setAuthor({ name: ` Error` })
            .setDescription("Kuch galat ho gaya! Console check karo.")
        ]
      });
    }
  },
};