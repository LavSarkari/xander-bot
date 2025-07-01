const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetai')
    .setDescription('Reset your conversation history with Xander.'),
  async execute(interaction, { userConversations }) {
    userConversations.delete(interaction.user.id);
    await interaction.reply({ content: '✅ Your conversation history has been cleared.', flags: 64 });
  }
}; 