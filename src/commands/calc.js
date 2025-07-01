const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { create, all } = require('mathjs');
const math = create(all);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('Evaluate a mathematical expression.')
    .addStringOption(option =>
      option.setName('expression')
        .setDescription('The expression to evaluate (e.g., 9/4 * 2)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const expression = interaction.options.getString('expression');
    try {
      const result = math.evaluate(expression);
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🧮 Calculator')
        .addFields(
          { name: 'Input', value: `${expression}` },
          { name: 'Result', value: `${result}` }
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `❌ **Error:**\n${error.message}`, ephemeral: true });
    }
  }
}; 