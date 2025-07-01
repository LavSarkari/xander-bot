const { SlashCommandBuilder } = require('discord.js');
const { analyze } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Analyze text for sentiment, topics, and tone.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to analyze')
        .setRequired(true)
    ),
  async execute(interaction, { logToWebhook }) {
    const input = interaction.options.getString('text');
    try {
      await interaction.deferReply({ flags: 64 });
      const result = await analyze(input);
      await interaction.editReply({ content: `**Analysis of your text:**\n\n${result}` });
      await logToWebhook(`analyze used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      await interaction.editReply({ content: 'Error analyzing text.' });
    }
  }
}; 