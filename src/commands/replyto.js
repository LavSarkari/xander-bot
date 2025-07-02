const { SlashCommandBuilder } = require('discord.js');
const { replyTo } = require('../lib/ai.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('replyto')
    .setDescription('Get AI-generated replies in different styles.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to reply to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Reply style (formal, roast, poetic, sarcastic, casual)')
        .setRequired(true)
        .addChoices(
          { name: 'Formal', value: 'formal' },
          { name: 'Roast', value: 'roast' },
          { name: 'Poetic', value: 'poetic' },
          { name: 'Sarcastic', value: 'sarcastic' },
          { name: 'Casual', value: 'casual' }
        )
    ),
  async execute(interaction, { logToWebhook }) {
    const text = interaction.options.getString('text');
    const style = interaction.options.getString('style');
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 64 });
      deferred = true;
      const result = await replyTo(text, style);
      await interaction.editReply({ content: result });
      await logToWebhook(`replyto used by ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      if (deferred) {
        await interaction.editReply({ content: 'Error generating reply.' });
      } else {
        await interaction.reply({ content: 'Error generating reply.' });
      }
      return;
    }
  }
}; 