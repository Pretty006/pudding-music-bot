const { EmbedBuilder } = require("discord.js");
const UserProfile = require("../../models/UserProfileSchema.js");

module.exports = {
  name: "fav-list",
  description: "Show your saved favorite songs",
  category: "Music",
  aliases: ["favorites", "favs", "fav"],

  run: async (client, message) => {
    
    const userId = message.author.id;
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
            .setTitle(" No Favorites Saved")
            .setDescription("You haven't added any tracks to favorites yet.")
            .setFooter({
              text: `Requested by ${message.author.tag}`,
              iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp()
        ]
      });
    }

    const favs = userProfile.favorites
      .map((track, index) => `**${index + 1}.** [${track.title}](${track.uri})`)
      .join("\n");

    return message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#2b2d31")
          .setAuthor({
            name: " Your Favorite Tracks",
            iconURL: client.user.displayAvatarURL()
          })
          .setDescription(favs)
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .setFooter({
            text: `Requested by ${message.author.tag}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setTimestamp()
      ]
    });
  }
};