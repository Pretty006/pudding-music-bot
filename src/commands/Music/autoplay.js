const { EmbedBuilder } = require("discord.js");
const { autoplayHandler } = require("../../handlers/autoplay.js");

module.exports = {
  name: "autoplay",
  aliases: ["ap"],
  description: "Toggle autoplay mode",
  category: "Music",
  cooldown: 5,
  inVc: true,
  sameVc: true,
  run: async (client, message, args, prefix, player) => {
    try {
      if (!player) {
        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31")
              .setAuthor({
                  name: "Autoplay",
                iconURL: client.user.displayAvatarURL(),
              })
              .setTitle(`<:no:1447588569693687903> No Music Player`)
              .setDescription(`<:RedDot:1447587369430679663> Start playing music with \`${prefix}play <song>\` to use autoplay.`)
              
              .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
              .setFooter({
                text: `Requested by ${message.author.username}`,
                  iconURL: message.author.displayAvatarURL(),
              })
          ],
        });
      }

      if (player.data.get("autoplay")) {
        player.data.set("autoplay", false);
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31") // Spotify green
              .setAuthor({
                name: "Autoplay",
                iconURL: client.user.displayAvatarURL(),
              })
              .setTitle(`<:yes:1447593797306417174> Autoplay Deactivated`)
              .setDescription(
                `<:RedDot:1447587369430679663>Use \`${prefix}autoplay\` again to reactivate it.`
              )
              .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL(),
              })
          ],
        });
      } else {
        player.data.set("autoplay", true);
        player.data.set("requester", message.author);

        if (player.queue.current) {
          player.data.set("identifier", player.queue.current.identifier);
          player.data.set("lastTrack", player.queue.current);
          await autoplayHandler(player, client, player.queue.current);
        }

        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2b2d31") // Spotify green
              .setAuthor({
                name: "Autoplay",
                iconURL: client.user.displayAvatarURL(),
              })
              .setTitle(`<:yes:1447593797306417174> Autoplay Activated`)
              .setDescription(
                `<:RedDot:1447587369430679663>Use \`${prefix}autoplay\` again to deactivate it.`
              )
              .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
              .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL(),
              })
          ],
        });
      }
    } catch (err) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#2b2d31")
            .setAuthor({
              name: "Autoplay",
              iconURL: client.user.displayAvatarURL(),
            })
            .setTitle(`<:no:1447588569693687903> Error`)
            .setDescription(
              `<:RedDot:1447587369430679663>An error occurred while toggling autoplay.\n` +
              `<:RedDot:1447587369430679663>Please try again or contact support if the issue persists.`
            )
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .setFooter({
              text: `Requested by ${message.author.username}`,
              iconURL: message.author.displayAvatarURL(),
            })
        ],
      });
    }
  },
};