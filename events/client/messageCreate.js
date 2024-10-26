const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (!message.guild) return;
    if (message.author.bot) return;
    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();
    if (message.channel.type === 'DM') {
      await message.reply("Sorry, But You Can't Use Me In Direct Messages!");
      return;
    }
  },
};
