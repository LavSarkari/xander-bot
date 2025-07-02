const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Xander anything.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The question you want to ask')
        .setRequired(true)
    ),
  async execute(interaction, { userConversations, openai, safeOpenAICall }) {
    const message = interaction.options.getString('message');
    const userId = interaction.user.id;
    let history = [];
    history.push({ role: 'user', content: message });
    let deferred = false;
    try {
      await interaction.deferReply({ flags: 64 });
      deferred = true;
      const chatCompletion = await safeOpenAICall(() => openai.chat.completions.create({
        model: 'gpt-4o',
        messages: history,
      }), 'openai.chat.completions.create');
      const response = chatCompletion.choices[0].message;
      history.push(response);
      userConversations.set(userId, history);
      const replyEmbed = new EmbedBuilder()
        .setColor(0xADD8E6)
        .addFields(
          { name: '💬 You asked...', value: message },
          { name: '🤖 Xander says...', value: response.content }
        );
      await interaction.editReply({ embeds: [replyEmbed] });
    } catch (error) {
      if (deferred) {
        await interaction.editReply({ content: '❌ An error occurred while talking to the AI.', flags: 64 });
      } else {
        await interaction.reply({ content: '❌ An error occurred while talking to the AI.', flags: 64 });
      }
    }
  }
}; 