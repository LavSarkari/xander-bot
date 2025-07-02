const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('See how compatible two users are.')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('The first user')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('The second user')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option.setName('chaos')
        .setDescription('Add some drama?')
    ),
  async execute(interaction, { openai, safeOpenAICall }) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const chaos = interaction.options.getBoolean('chaos') || false;
    const combinedId = `${user1.id.slice(-4)}${user2.id.slice(-4)}`;
    const seed = parseInt(combinedId, 10);
    const compatibility = (seed % 100) + 1;
    const otpName = `${user1.username.slice(0, Math.ceil(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}`;
    const vibeBar = '❤️'.repeat(Math.floor(compatibility / 10)) + '💔'.repeat(10 - Math.floor(compatibility / 10));
    let deferred = false;
    try {
      await interaction.deferReply();
      deferred = true;
      let prompt = `Why are ${user1.username} and ${user2.username} ${compatibility}% compatible? Give a fun, one-sentence reason.`;
      if (chaos) {
        prompt += ' Also, add a random, funny insult or a fictional dramatic scandal about their relationship.';
      }
      const chatCompletion = await safeOpenAICall(() => openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      }), 'openai.chat.completions.create');
      const reason = chatCompletion.choices[0].message.content;
      const shipEmbed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setTitle(`💘 Shipping ${user1.username} & ${user2.username} 💘`)
        .setDescription(`**OTP Name:** **${otpName}**`)
        .setThumbnail('https://cdn.discordapp.com/emojis/892293286826504242.webp?size=128')
        .addFields(
          { name: 'Compatibility', value: `**${compatibility}%**` },
          { name: 'Vibe Check', value: vibeBar },
          { name: "Xander's Verdict", value: `*${reason}*` }
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [shipEmbed] });
    } catch (error) {
      if (deferred) {
        await interaction.editReply({ content: '❌ An error occurred while calculating the ship.', flags: 64 });
      } else {
        await interaction.reply({ content: '❌ An error occurred while calculating the ship.', flags: 64 });
      }
      return;
    }
  }
}; 