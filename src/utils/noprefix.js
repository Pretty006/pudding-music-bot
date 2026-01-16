const { getGuild } = require("./guildConfig");

module.exports.hasNoPrefix = async (guildId) => {
  const data = await getGuild(guildId);
  return data.noPrefix;
};