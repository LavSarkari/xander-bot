const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a private reminder.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('What to be reminded of')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('time')
        .setDescription('When to be reminded (e.g., in 10m, tomorrow at 8am)')
        .setRequired(true)
    ),
  async execute(interaction, { userReminders, chrono }) {
    const text = interaction.options.getString('text');
    const time = interaction.options.getString('time');
    const parsedDate = chrono.parseDate(time);
    if (!parsedDate) {
      await interaction.reply({ content: '❌ Invalid time format. Please use something like "in 10m" or "tomorrow at 8am".', flags: 64 });
      return;
    }
    const reminderTime = parsedDate.getTime();
    const now = Date.now();
    if (reminderTime <= now) {
      await interaction.reply({ content: '❌ The time you provided is in the past.', flags: 64 });
      return;
    }
    const userId = interaction.user.id;
    if (!userReminders.has(userId)) {
      userReminders.set(userId, []);
    }
    userReminders.get(userId).push({ text, time: reminderTime });
    setTimeout(() => {
      interaction.user.send(`⏰ **Reminder:** ${text}`).catch(e => {});
      const reminders = userReminders.get(userId);
      if (reminders) {
        userReminders.set(userId, reminders.filter(r => r.time !== reminderTime));
      }
    }, reminderTime - now);
    await interaction.reply({ content: `✅ Reminder set for <t:${Math.floor(reminderTime / 1000)}:f>! I'll DM you then.`, flags: 64 });
  }
}; 