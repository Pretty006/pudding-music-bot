const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../models/UserProfileSchema.js");

module.exports = {
  name: "fav-play",
  description: "Play a song from your favourites list",
  category: "Music",
  aliases: ["fplay"],

  run: async (client, message, args) => {
    
    const userId = message.author.id;
    const number = parseInt(args[0]);

    const userProfile = await UserProfile.findOne({ userId });

    if (!userProfile || !userProfile.favorites.length) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
              name: "Favorites Manager",
              iconURL: client.user.displayAvatarURL()
            })
            .setTitle("❌ No Favorites Found")
            .setDescription("You don't have any saved songs to play.")
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        ]
      });
    }

    if (!number || number < 1 || number > userProfile.favorites.length) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
              name: "Favorites Manager",
              iconURL: client.user.displayAvatarURL()
            })
            .setTitle("⚠️ Invalid Selection")
            .setDescription(`Please choose a valid track number between **1 - ${userProfile.favorites.length}**`)
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        ]
      });
    }

    const track = userProfile.favorites[number - 1];

    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel?.id,
      textId: message.channel.id,
      deaf: true
    });

    const res = await player.search(track.uri, { requester: message.author });

    if (!res.tracks.length) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setTitle("❌ Error Playing Track")
            .setDescription("Unable to play this favorite song. It may be unavailable.")
        ]
      });
    }

    player.queue.add(res.tracks[0]);
    if (!player.playing) player.play();

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setAuthor({
            name: "🎶 Playing From Favorites",
            iconURL: client.user.displayAvatarURL()
          })
          .setDescription(`Now playing **${res.tracks[0].title}**`)
          .setThumbnail(res.tracks[0].thumbnail)
          .addFields(
            { name: "Requested By", value: `<@${message.author.id}>`, inline: true },
            { name: "Source", value: res.tracks[0].sourceName || "Unknown", inline: true }
          )
          .setFooter({
            text: `Requested by ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp()
      ]
    });

  }
};