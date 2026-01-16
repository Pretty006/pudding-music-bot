const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { KazagumoTrack } = require("kazagumo");
const setplayer = require("../../models/SetupPlayerSchema.js");
const setup = require("../../models/SetupSchema.js");
const updateMessage = require("../../handlers/setupQueue.js");
const { autoplayHandler } = require("../../handlers/autoplay.js");

module.exports = async (client) => {
  client.manager.on("playerStart", async (player, track) => {
    try {
      const playerConfig = await setplayer.findOne({ guildId: player.guildId });
      const mode = playerConfig?.playerMode || "classic";
      const updateData = await setup.findOne({ guildId: player.guildId });

      if (updateData && updateData.channelId == player.textId) return;

      player.previousTrack = player.currentTrack || null;
      player.currentTrack = track;

      if (mode !== "classic") return;

      const channel = client.channels.cache.get(player.textId);
      if (!channel) return;

      // 👉 NOW PLAYING MESSAGE + BUTTONS
    if (player.nowPlayingMessage) {

  await player.nowPlayingMessage.delete().catch(() => {});

  player.nowPlayingMessage = null;

}    
      const nplaying = await channel.send({
        embeds: [
          buildNowPlayingEmbed(track, client, player, channel.guild)
        ],
        components: getPlayerButtons(player)
      });
player.nowPlayingMessage = nplaying;
      const filter = (i) =>
        i.guild.members.me.voice.channel &&
        i.guild.members.me.voice.channelId === i.member.voice.channelId;

      const collector = nplaying.createMessageComponentCollector({
        filter,
        time: 3600000
      });

      collector.on("collect", async (interaction) => {
        await interaction.deferUpdate();
        let feedback;

        switch (interaction.customId) {
          case "pause":
            await player.pause(!player.paused);
            feedback = `<:play:1447588707510124644> Track has been **${player.paused ? "paused" : "resumed"}**.`;
            break;

          case "skip": {
            const botVc = interaction.guild.members.me.voice.channelId;
            const userVc = interaction.member.voice.channelId;

            if (!userVc || userVc !== botVc) {
              return interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setColor("#000000")
                    .setDescription("⚠️ You must be in the same voice channel as me.")
                ],
                ephemeral: true
              });
            }

            if (player.queue.size > 0) {
              await player.skip();
              feedback = `<:forward:1447587996877455444> Skipped to the next track.`;
            } else if (player.data.get("autoplay")) {
              const baseTrack = player.currentTrack || player.previousTrack;
              const next = await autoplayHandler(player, client, baseTrack);

              if (next) {
                await player.play(next);
                feedback = `<:loop:1447588450327859302> Autoplay started **${next.title}**.`;
              } else {
                await player.destroy();
                feedback = `<:resume:1447588983973478503> No related track found. Playback stopped.`;
              }
            } else {
              await player.destroy();
              feedback = `<:resume:1447588983973478503> No more tracks in queue. Playback stopped.`;
            }
            break;
          }

          case "back": {
            const previous = player.previousTrack;
            if (previous) {
              const fixed = KazagumoTrack.create(
                player,
                previous,
                previous.requester || interaction.user
              );
              await player.play(fixed);
              feedback = `<:rewind:1447589029200793651> Playing previous track.`;
            } else {
              feedback = "❌ No previous track available.";
            }
            break;
          }

          case "shuffle":
            player.queue.shuffle();
            feedback = `<:shuffle:1447589169034428428> Queue shuffled.`;
            break;

          case "loop":
            const loop = player.loop === "track" ? "none" : "track";
            await player.setLoop(loop);
            feedback = `<:loop:1447588450327859302> Loop **${loop === "track" ? "enabled" : "disabled"}**.`;
            break;
        }

        if (feedback) {
          const msg = await interaction.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#000000")
                .setDescription(feedback)
            ]
          });
          setTimeout(() => msg.delete().catch(() => {}), 5000);
        }

        await nplaying.edit({
          embeds: [
            buildNowPlayingEmbed(player.currentTrack || track, client, player, interaction.guild)
          ],
          components: getPlayerButtons(player)
        }).catch(() => {});
      });

      collector.on("end", async () => {
        await nplaying.edit({
          components: getPlayerButtons(player, true)
        }).catch(() => {});
      });

    } catch (e) {
      console.error("playerStart error:", e);
    }
  });
};

function buildNowPlayingEmbed(track, client, player, guild) {
  const duration = formatMs(track.length);

  return new EmbedBuilder()
    .setColor("#000000")
    .setAuthor({
      name: "Now playing"
    })
    .setDescription(`<:music:1447588489150337024>**${track.title.split(" (")[0]}**`)
    .addFields(
      { name: "Duration", value: `\`${duration}\``, inline: true },
      { name: "Source", value: `\`${track.sourceName || "Unknown"}\``, inline: true }
    )
    .setThumbnail(track.thumbnail || null)
    .setFooter({
      text: `Requested by ${track.requester?.tag || "Unknown"}`,
      iconURL: guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
    });
}

function getPlayerButtons(player, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("loop")
        .setEmoji("<:loop:1447588450327859302>")
        .setStyle(player.loop === "track" ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(disabled),

      new ButtonBuilder()
        .setCustomId("back")
        .setEmoji("<:rewind:1447589029200793651>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),

      new ButtonBuilder()
        .setCustomId("pause")
        .setEmoji(player.paused ? "<:play:1447588707510124644>" : "<:pause:1447588627705237585>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),

      new ButtonBuilder()
        .setCustomId("skip")
        .setEmoji("<:forward:1447587996877455444>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),

      new ButtonBuilder()
        .setCustomId("shuffle")
        .setEmoji("<:shuffle:1447589169034428428>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled)
    )
  ];
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}