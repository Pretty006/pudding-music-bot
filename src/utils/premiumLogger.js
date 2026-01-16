module.exports = async (client, text) => {
  const ch = await client.channels.fetch(client.config.LOG_CHANNEL).catch(()=>null);
  if (!ch) return;
  ch.send({ content: `🖤 **Pudding Premium**\n${text}` });
};