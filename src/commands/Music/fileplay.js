const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { createAudioResource } = require("@discordjs/voice");
const updateQueue = require("../../handlers/setupQueue.js");

module.exports = {
  name: "fileplay",
  aliases: ["fp", "filep"],
  description: "Play a song from an uploaded audio file",
  category: "Music",
  inVc: true,
  sameVc: true,
  dj: true,
  premium: false,

  run: async (client, message, args, prefix) => {
    try {
      // No file check
      if (!message.attachments.size) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ File Play Failed" })
              .setDescription(
                `Koi audio file attach nahi ki hai!\n` +
                  `Please valid **.mp3 / .wav / .ogg / .m4a** file upload karo.\n\n` +
                  `Example: \`${prefix}fileplay\` + attach audio 🎶`
              )
              .setFooter({ text: "Pudding Music" })
              .setTimestamp(),
          ],
        });
      }

      const file = message.attachments.first();
      const fileUrl = file.url;

      // Extension check
      if (!/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ Invalid Audio File" })
              .setDescription(
                `Ye file supported nahi hai!\n` +
                  `Sirf **mp3, wav, ogg, m4a** allowed hai.`
              )
              .setFooter({ text: "Pudding Music" })
              .setTimestamp(),
          ],
        });
      }

      let player = client.manager.players.get(message.guild.id);
      if (!player) {
        player = await client.manager.createPlayer({
          guildId: message.guild.id,
          textId: message.channel.id,
          voiceId: message.member.voice.channel.id,
          volume: 75,
          deaf: true,
          shardId: message.guild.shardId,
        });
      }

      const resource = createAudioResource(fileUrl, {
        metadata: {
          title: file.name,
          uri: fileUrl,
          requester: message.author,
        },
      });

      player.queue.add(resource.metadata);
      const wasPlaying = player.playing || player.paused;

      try {
        if (!wasPlaying) await player.play(resource);
      } catch {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#ff0000")
              .setAuthor({ name: "⛔ Playback Error" })
              .setDescription(
                `File play nahi ho payi.\n` +
                  `Ensure karo file valid audio ho & fir try karo.`
              )
              .setFooter({ text: "Pudding Music" })
              .setTimestamp(),
          ],
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#00ffa2")
        .setAuthor({ name: "🎧 File Player" })
        .setDescription(
          wasPlaying
            ? `Track queue me **add ho gaya!**\nUse \`${prefix}queue\` to view queue.`
            : `Track **abhi play ho raha hai!**\nUse \`${prefix}nowplaying\` for details.`
        )
        .addFields(
          {
            name: "📌 File",
            value: `[${resource.metadata.title}](${resource.metadata.uri})`,
            inline: false,
          },
          {
            name: "👤 Requested By",
            value: `${message.author}`,
            inline: true,
          }
        )
        .setFooter({ text: "Pudding Music" })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("upcoming")
          .setLabel("Play Next")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji("⏭️"),
        new ButtonBuilder()
          .setCustomId("remove_song")
          .setLabel("Remove")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("🗑️")
      );

      const showButtons = player.queue.length >= (wasPlaying ? 2 : 1);

      const msg = await message.reply({
        embeds: [embed],
        components: showButtons ? [row] : [],
      });

      if (showButtons) {
        const collector = msg.createMessageComponentCollector({
          filter: (i) => i.user.id === message.author.id,
        });

        collector.on("collect", async (i) => {
          if (!i.isButton()) return;

          if (i.customId === "remove_song") {
            player.queue.pop();
            return i.update({
              embeds: [
                new EmbedBuilder()
                  .setColor("#00ffa2")
                  .setAuthor({ name: "🗑️ Track Removed" })
                  .setDescription(
                    `Track queue se **remove** kar diya gaya.\n\`${prefix}queue\` se check karo.`
                  ),
              ],
              components: [],
            });
          }

          if (i.customId === "upcoming") {
            const upcoming = player.queue.pop();
            player.queue.splice(0, 0, upcoming);
            return i.update({
              embeds: [
                new EmbedBuilder()
                  .setColor("#00ffa2")
                  .setAuthor({ name: "⏭️ Playing Next" })
                  .setDescription(
                    `Track ab current song ke baad play hoga!\n\`${prefix}queue\` dekh lo.`
                  ),
              ],
              components: [],
            });
          }
        });
      }

      await updateQueue(message.guild, player.queue);
    } catch (err) {
      console.log(err);
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0000")
            .setAuthor({ name: "❌ Error" })
            .setDescription(
              `Kuch galat ho gaya! Agar repeat ho to support se contact karo.`
            )
            .setFooter({ text: "Pudding Music" })
            .setTimestamp(),
        ],
      });
    }
  },
};