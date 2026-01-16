const { EmbedBuilder } = require("discord.js");

module.exports = (title, desc) => {
  return new EmbedBuilder()
    .setColor("#0b0d10")
    .setAuthor({ name: "Pudding Premium" })
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: "Pudding Music • Premium" });
};