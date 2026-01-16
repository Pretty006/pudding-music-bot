const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "back",
  aliases: ["b", "previous"],
  description: "Plays the previous song in the queue",
  category: "Music",

  run: async (client, message) => {

    try {
      const player = client.kazagumo?.players.get(message.guild.id);

      // No player
      if (!player) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: ` Back Failed` })
              .setDescription(`Currently koi music play nahi ho raha!`)
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
              .setDescription("Pehle **voice channel join** karo!")
          ]
        });
      }

      // Bot and User must be in same vc
      if (player.voiceId !== message.member.voice.channel.id) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "❌ Same Voice Channel Required" })
              .setDescription("Bot ke saath **same voice channel** join karo!")
          ]
        });
      }

      // No previous track
      if (!player.queue.previous) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ Back Failed" })
              .setDescription("Koi **previous track** nahi mila!")
          ]
        });
      }

      await player.queue.previous.play();

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#00ffa2")
            .setAuthor({ name: "⏪ Previous Track" })
            .setDescription("Pichla gaana **play ho raha hai** 🎶")
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
            .setDescription("Kuch galat ho gaya, console check karo!")
        ]
      });
    }

  }
};