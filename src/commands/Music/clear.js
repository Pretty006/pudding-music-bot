const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "clear",
  aliases: ["cq", "clearqueue"],
  description: "Clears the music queue",
  category: "Music",

  run: async (client, message) => {
    try {
      const player = client.kazagumo?.players.get(message.guild.id);

      // No player / music
      if (!player) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ Clear Failed" })
              .setDescription("Abhi koi **music play nahi ho raha!** 🎧")
          ]
        });
      }

      // User not in vc
      if (!message.member.voice.channel) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "🎧 Voice Required" })
              .setDescription("Pehle **voice channel join** karo! 😅")
          ]
        });
      }

      // Must be in same vc
      if (player.voiceId !== message.member.voice.channel.id) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "❌ Same Voice Channel Required" })
              .setDescription("Bot ke saath **same channel** join karo!")
          ]
        });
      }

      // Queue empty?
      if (!player.queue || !player.queue.tracks?.length) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ Clear Failed" })
              .setDescription("Queue already **empty hai** 😎")
          ]
        });
      }

      // Clear Queue
      player.queue.clear();

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ffa2")
            .setAuthor({ name: "🧹 Queue Cleared" })
            .setDescription("Saari songs queue se **clear ho gayi!** 🎶")
            .setTimestamp()
        ]
      });

    } catch (err) {
      console.log(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0000")
            .setAuthor({ name: "❌ Error" })
            .setDescription("Kuch galat ho gaya! Console check karo.")
        ]
      });
    }
  }
};