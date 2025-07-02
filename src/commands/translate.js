const { SlashCommandBuilder } = require('discord.js');
const { translate } = require('../lib/ai.js');
const TRANSLATE_COOLDOWN = 10 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to English')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true)
    ),
  async execute(interaction, { translateCooldowns, logToWebhook }) {
    const userId = interaction.user.id;
    const now = Date.now();
    const lastUsed = translateCooldowns.get(userId) || 0;
    const remaining = Math.ceil((lastUsed + TRANSLATE_COOLDOWN - now) / 1000);
    if (now < lastUsed + TRANSLATE_COOLDOWN) {
      await interaction.reply({ content: `⏳ Please wait ${remaining} more second(s) before using /translate again.`, flags: 64 });
      return;
    }
    translateCooldowns.set(userId, now);
    const input = interaction.options.getString('text');
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 64 });
      deferred = true;
      const result = await translate(input);
      await interaction.editReply({ content: `**Original:** ${input}\n**Translated:** ${result}` });
      await logToWebhook(`User: ${interaction.user.tag} (${interaction.user.id})\nInput: ${input}\nChannel: ${interaction.channelId}\nGuild: ${interaction.guild ? interaction.guild.name + ' (' + interaction.guild.id + ')' : 'DM'}`);
    } catch (err) {
      if (deferred) {
        await interaction.editReply({ content: 'Error translating text.' });
      } else {
        await interaction.reply({ content: 'Error translating text.' });
      }
      return;
    }
  }
}; 