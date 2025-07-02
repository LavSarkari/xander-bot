const { SlashCommandBuilder } = require('discord.js');
const { explain } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('explain')
    .setDescription('Explain a text in simple terms.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to explain')
        .setRequired(true)
    ),
  async execute(interaction, { logToWebhook }) {
    const input = interaction.options.getString('text');
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 64 });
      deferred = true;
      const result = await explain(input);
      await interaction.editReply({ content: `**Original:**\n${input}\n\n**Explanation:**\n${result}` });
      await logToWebhook(`explain used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      if (deferred) {
        await interaction.editReply({ content: 'Error explaining text.' });
      } else {
        await interaction.reply({ content: 'Error explaining text.' });
      }
      return;
    }
  }
}; 