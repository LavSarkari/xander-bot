const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getRandomCompliment } = require('../lib/utils');

const categories = {
  ai: { label: 'AI & Fun', emoji: '🤖', description: 'AI-powered commands for fun and assistance.', commands: ['explain', 'emojify', 'airoast', 'imagine', 'ask', 'continue', 'resetai', 'replyto'] },
  utility: { label: 'Utility', emoji: '🛠️', description: 'Helpful tools and utilities.', commands: ['whoami', 'calc', 'ship'] },
  notes: { label: 'Notes & Reminders', emoji: '📝', description: 'Manage your personal notes and reminders.', commands: ['note', 'remind', 'listnotes', 'clearnotes'] },
  vibe: { label: 'Vibe & Matching', emoji: '🌈', description: 'Find friends, match, and manage your vibe profile.', commands: ['vibeform', 'editvibe', 'ghostmode', 'findmatch', 'reveal', 'matchstats', 'shipfriend', 'friend', 'profile'] }
};

function generateMainMenu(client) {
  const mainEmbed = new EmbedBuilder()
    .setColor(0xFFC0CB)
    .setTitle('🌸 Xander Help Menu 🌸')
    .setDescription(
`✨ **Welcome to Xander!** ✨\n\nHere's what I can do for you:\n\n**🤖 AI & Fun**\n/explain, /emojify, /airoast, /imagine, /ask, /continue, /resetai\n\n**🛠️ Utility**\n/whoami, /calc, /ship\n\n**📝 Notes & Reminders**\n/note, /remind, /listnotes, /clearnotes\n\n**🌈 Vibe & Matching**\n/vibeform, /editvibe, /ghostmode, /findmatch, /reveal, /matchstats, /shipfriend, /friend, /profile\n\nPick a category below for more details, or just explore!`)
    .setThumbnail(client.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: getRandomCompliment(), iconURL: 'https://cdn.discordapp.com/emojis/924923943746428928.webp?size=128' });

  const categorySelect = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Select a category')
      .addOptions(
        Object.entries(categories).map(([key, cat]) => ({
          label: cat.label,
          value: key,
          description: cat.description,
          emoji: cat.emoji
        }))
      )
  );

  const linkButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Support Server')
      .setURL('https://discord.gg/ice-cafe')
      .setStyle(5)
      .setEmoji('🧊'),
    new ButtonBuilder()
      .setLabel('Invite Me!')
      .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands`)
      .setStyle(5)
      .setEmoji('💌')
  );
  const closeButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help_close')
      .setLabel('Close')
      .setStyle(4)
      .setEmoji('❌')
  );
  return { embeds: [mainEmbed], components: [categorySelect, linkButtons, closeButtonRow], flags: 64 };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of all available commands.'),
  async execute(interaction, { client }) {
    await interaction.reply(generateMainMenu(client));
  },
  async handleComponent(interaction, { client, commands }) {
    if (interaction.customId === 'help_close') {
      await interaction.update({ content: 'Help menu closed. Have a wonderful day! 🌸', embeds: [], components: [] });
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'help_category_select') {
      const categoryKey = interaction.values[0];
      const category = categories[categoryKey];
      if (!category) return;
      const commandOptions = commands
        .filter(cmd => category.commands.includes(cmd.data.name))
        .map(cmd => ({
          label: '/' + cmd.data.name,
          description: cmd.data.description,
          value: `${categoryKey}_${cmd.data.name}`
        }));
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder(`Select a command from ${category.label}`)
        .addOptions(commandOptions);
      const menuRow = new ActionRowBuilder().addComponents(selectMenu);
      const backButtonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_back_main')
          .setLabel('Go Back to Main Menu')
          .setStyle(2)
      );
      const closeButtonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_close')
          .setLabel('Close')
          .setStyle(4)
          .setEmoji('❌')
      );
      const categoryEmbed = new EmbedBuilder()
        .setColor(0xFFC0CB)
        .setTitle(`${category.emoji} ${category.label}`)
        .setDescription(category.description || 'Please select a command from the dropdown menu to see more information.')
        .setFooter({ text: getRandomCompliment(), iconURL: 'https://cdn.discordapp.com/emojis/924923943746428928.webp?size=128' });
      await interaction.update({ embeds: [categoryEmbed], components: [menuRow, backButtonRow, closeButtonRow], flags: 64 });
      return;
    }
    if (interaction.customId === 'help_back_main') {
      await interaction.update(generateMainMenu(client));
      return;
    }
    if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') {
      const [categoryKey, commandName] = interaction.values[0].split('_');
      const command = commands.find(cmd => cmd.data.name === commandName);
      const category = categories[categoryKey];
      if (!command || !category) return;
      const commandEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('`/' + command.data.name + '`')
        .setDescription(command.data.description)
        .setFooter({ text: getRandomCompliment(), iconURL: 'https://cdn.discordapp.com/emojis/924923943746428928.webp?size=128' });
      if (command.data.options && command.data.options.length > 0) {
        const usage = command.data.options.map(opt => `\`${opt.name}\`${opt.required ? '' : ' (optional)'}`).join(' ');
        commandEmbed.addFields({ name: 'Usage', value: `\`/${command.data.name} ${usage}\`` });
      }
      // Re-render the select menu and back button so the user can select another command
      const commandOptions = commands
        .filter(cmd => category.commands.includes(cmd.data.name))
        .map(cmd => ({
          label: '/' + cmd.data.name,
          description: cmd.data.description,
          value: `${categoryKey}_${cmd.data.name}`
        }));
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select')
        .setPlaceholder('Select another command')
        .addOptions(commandOptions);
      const menuRow = new ActionRowBuilder().addComponents(selectMenu);
      const backButtonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_back_main')
          .setLabel('Go Back to Main Menu')
          .setStyle(2)
      );
      await interaction.update({ embeds: [commandEmbed], components: [menuRow, backButtonRow] });
      return;
    }
  }
}; 