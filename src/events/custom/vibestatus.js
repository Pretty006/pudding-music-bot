const { VibeSync } = require("vibesync");
const VcStatus = require("../../models/vcstatus");
const {
  PermissionsBitField,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const lastUpdateAt = new Map();
const DEBOUNCE_MS = 1000;
const DEFAULT_STATUS = "♪ pudding";

function okToUpdate(voiceId, force = false) {
  const now = Date.now();
  const prev = lastUpdateAt.get(voiceId) || 0;
  if (!force && now - prev < DEBOUNCE_MS) return false;
  lastUpdateAt.set(voiceId, now);
  return true;
}

module.exports = (client) => {

  if (!client.vibeSync) client.vibeSync = new VibeSync(client);
  const vibe = client.vibeSync;

  const canBotSetForChannel = (guild, voiceId) => {
    const channel = guild.channels.cache.get(voiceId);
    if (!channel) return false;

    if (
      channel.type !== ChannelType.GuildVoice &&
      channel.type !== ChannelType.GuildStageVoice
    ) return false;

    const me = guild.members.me;
    if (!me) return false;

    const perms = channel.permissionsFor(me);
    return perms?.has(PermissionsBitField.Flags.ManageChannels) || false;
  };

  const updateVoiceStatus = async (player, statusText, force = false) => {
    try {
      if (!player) return;

      const guildId = player.guildId || player.guild;
      const voiceId = player.voiceId;
      if (!guildId || !voiceId) return;

      const config = await VcStatus.findOne({ guildId });
      if (!config || !config.enabled) return;

      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;

      if (!canBotSetForChannel(guild, voiceId)) {
        await VcStatus.findOneAndUpdate(
          { guildId },
          { enabled: false },
          { upsert: true }
        );
        console.warn(
          `⚠️ Auto-disabled VC status for ${guildId} (missing permissions)`
        );
        return;
      }

      if (!okToUpdate(voiceId, force)) return;

      if (statusText && statusText.trim().length) {
        await vibe.setVoiceStatus(voiceId, statusText.trim());
      }

    } catch (err) {
      console.error("VibeSync error:", err);
    }
  };

  const updateFromCurrent = async (player, force = false) => {
    const current = player?.queue?.current;
    if (current) {
      await updateVoiceStatus(player, `♪ ${current.title}`, force);
    }
  };

 // ================= PLAYER EVENTS =================
client.manager.on("playerStart", async (player, track) => {
  // ---- VC STATUS ----
  await updateVoiceStatus(player, `♪ ${track?.title ?? "Unknown"}`, true);
});

// Pause
client.manager.on("playerPause", async (player) => {
  const current = player?.queue?.current;
  if (current) await updateVoiceStatus(player, `♪ ${current.title}`, true);
});

// Resume
client.manager.on("playerResume", async (player) => {
  const current = player?.queue?.current;
  if (current) await updateVoiceStatus(player, `♪ ${current.title}`, true);
});

// Track End
client.manager.on("trackEnd", async (player) => {
  try {
    if (player.nowPlayingMessage) {
      await player.nowPlayingMessage.delete().catch(() => {});
      player.nowPlayingMessage = null;
    }

    await updateFromCurrent(player, true);
  } catch (e) {}
});

// Queue empty
client.manager.on("queueEnd", async (player) => {
  // 🔥 SKIP + NO NEXT SONG → DELETE NOW PLAYING
  if (player.nowPlayingMessage) {
    await player.nowPlayingMessage.delete().catch(() => {});
    player.nowPlayingMessage = null;
  }
});

// ================= BOT VC JOIN =================
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.member?.id !== client.user.id) return;

  if (!oldState.channelId && newState.channelId) {
    const guildId = newState.guild.id;
    const config = await VcStatus.findOne({ guildId });
    if (!config) return;

    if (config.enabled) {
      await vibe.setVoiceStatus(newState.channelId, "♪ pudding");
    } else {
      if (canBotSetForChannel(newState.guild, newState.channelId)) {
        await vibe.setVoiceStatus(newState.channelId, "");
}
      }
    }
  });
};