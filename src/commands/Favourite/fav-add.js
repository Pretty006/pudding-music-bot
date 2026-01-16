const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../models/UserProfileSchema.js");

module.exports = {
  name: "fav-add",
  description: "Add current playing song to favourites",
  category: "Music",
  aliases: ["fadd", "favorite-add"],

  run: async (client, message) => {
    
    const player = client.manager.players.get(message.guild.id);

    if (!player || !player.current) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({ name: "Favorites Manager", iconURL: client.user.displayAvatarURL() })
            .setTitle("<:no:1447588569693687903> No Song Playing")
            .setDescription("There is no song currently playing to add in favorites.")
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        ]
      });
    }

    const track = player.current;
    const userId = message.author.id;

    let userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
      userProfile = new UserProfile({
        userId,
        favorites: []
      });
    }

    const already = userProfile.favorites.find(x => x.uri === track.uri);
    if (already) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({ name: "Favorites Manager", iconURL: client.user.displayAvatarURL() })
            .setTitle("<:warn:1447593731690598461> Already In Favorites")
            .setDescription(`**${track.title}** is already saved in your favorites list.`)
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        ]
      });
    }

    userProfile.favorites.push({
      title: track.title,
      uri: track.uri,
      thumbnail: track.thumbnail
    });

    await userProfile.save();

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setAuthor({ name: "Favorites Manager", iconURL: client.user.displayAvatarURL() })
          .setTitle("<:OxP:1447585974358900827>Added To Favorites")
          .setDescription(`Successfully added **${track.title}** to your favorites.`)
          .setThumbnail(track.thumbnail)
          .addFields(
            { name: "Duration", value: track.isStream ? "`LIVE`" : `\`${Math.floor(track.length / 1000)}s\``, inline: true },
            { name: "Requested By", value: `<@${message.author.id}>`, inline: true }
          )
          .setFooter({
            text: `Saved by ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp()
      ]
    });
  }
};