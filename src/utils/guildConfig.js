const GuildConfig = require("../models/GuildConfig");

async function getGuild(guildId) {
  let data = await GuildConfig.findOne({ guildId });
  if (!data) {
    data = await GuildConfig.create({ guildId });
  }
  return data;
}

async function setGuild(guildId, update) {
  return await GuildConfig.findOneAndUpdate(
    { guildId },
    update,
    { upsert: true, new: true }
  );
}

module.exports = { getGuild, setGuild };