const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Show your Discord user info'),
  async execute(interaction, { logToWebhook }) {
    await interaction.reply({
      content: `You are **${interaction.user.tag}** (ID: ${interaction.user.id})\nCreated: <t:${Math.floor(interaction.user.createdTimestamp/1000)}:F>`,
      flags: 64
    });
    await logToWebhook(`whoami used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
  }
}; 