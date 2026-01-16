const { getGuild } = require("./guildConfig");

module.exports.isPremium = async (guildId) => {
  const data = await getGuild(guildId);
  return Date.now() < data.premiumUntil;
};