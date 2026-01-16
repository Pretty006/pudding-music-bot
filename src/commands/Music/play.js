const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play a song or playlist",
  category: "Music",
  inVc: true,
  sameVc: true,

  run: async (client, message, args, prefix) => {
    try {
      const query = args.join(" ");
      if (!query) {
        return message.reply("❌ Song name ya playlist URL do.");
      }

      // Get or create player
      let player = client.manager.players.get(message.guild.id);
      if (!player) {
        player = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: message.member.voice.channel.id,
          textId: message.channel.id,
          deaf: true,
          volume: 80,
        });
      }

      // Search
      const res = await client.manager.search(query, {
        requester: message.author,
      });

      if (!res || !res.tracks || !res.tracks.length) {
        return message.reply("❌ Koi result nahi mila.");
      }

      // ======================
      // 🎵 PLAYLIST SUPPORT
      // ======================
      if (res.type === "PLAYLIST") {
        for (const track of res.tracks) {
          player.queue.add(track);
        }

        if (!player.playing && !player.paused) {
          await player.play();
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#000000")
              .setDescription(
                `<:playlist:1447589169034428428> **${res.tracks.length}** songs added from playlist`
              )
          ],
        });
      }

      // ======================
      // 🎶 SINGLE TRACK
      // ======================
      const track = res.tracks[0];
      player.queue.add(track);

      if (!player.playing && !player.paused) {
        await player.play();
      }

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#000000")
            .setDescription(
              `<:yes:1447593797306417174> Added **${track.title}**`
            )
        ],
      });

    } catch (err) {
      console.error("Play command error:", err);
      return message.reply("❌ Kuch galat ho gaya. Try again.");
    }
  },
};