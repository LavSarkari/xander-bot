const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Get started with Xander.'),
  async execute(interaction) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('👋 Welcome to Xander!')
      .setDescription('Your personal AI assistant. Here are some of the things I can do:')
      .addFields(
        { name: '`/help`', value: 'Gives you a list of commands and what they do.', inline: true },
        { name: '`/translate`', value: 'Translate any text into English.', inline: true },
        { name: '`/explain`', value: 'Get simple explanations for complex topics.', inline: true },
        { name: '`/imagine`', value: 'Generate an image from a text prompt.', inline: true },
        { name: '`/analyze`', value: 'Analyze text for sentiment, tone, and more.', inline: true },
        { name: '`/replyto`', value: 'Get AI-generated replies in different styles.', inline: true },
        { name: '`/airoast`', value: 'Roast a friend with a savage AI insult.', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Enjoy using Xander!' });
    await interaction.reply({ embeds: [welcomeEmbed], flags: 64 });
    try {
      await interaction.user.send({ embeds: [welcomeEmbed] });
    } catch (dmError) {
      await interaction.followUp({ content: '❌ I couldn\'t send you a DM. Please check your privacy settings.', flags: 64 });
    }
  }
}; 