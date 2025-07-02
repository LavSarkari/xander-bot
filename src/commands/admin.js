const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { isAdmin, addAdmin, removeAdmin, getAdmins, getBlacklist, addBlacklist, removeBlacklist, isBlacklisted } = require('../lib/admins');
const { getVibeProfiles, saveVibeProfiles } = require('./vibeform');
const { matchedPairs } = require('./findmatch');

async function resolveUser(input, client) {
  // Mention
  const mentionMatch = input.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    return await client.users.fetch(mentionMatch[1]).catch(() => null);
  }
  // User ID
  if (/^\d{15,20}$/.test(input)) {
    return await client.users.fetch(input).catch(() => null);
  }
  // Username (case-insensitive)
  const user = client.users.cache.find(u => u.username.toLowerCase() === input.toLowerCase());
  if (user) return user;
  // Not found
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin commands')
    .addSubcommand(sub =>
      sub.setName('addadmin')
        .setDescription('Add a new admin')
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to add as admin')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('removeadmin')
        .setDescription('Remove an admin')
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to remove from admins')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('listadmins')
        .setDescription('List all admins')
    )
    .addSubcommand(sub =>
      sub.setName('dm')
        .setDescription('DM a user as the bot (admin only)')
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to DM')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Message to send')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('broadcast')
        .setDescription('DM all users with a message')
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Message to send to all users')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('userinfo')
        .setDescription('Show info for a user')
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to look up')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('removeprofile')
        .setDescription('Remove a user profile')
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to remove profile for')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('forcematch')
        .setDescription('Force match two users')
        .addStringOption(opt =>
          opt.setName('user1')
            .setDescription('First user mention, username, or ID')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('user2')
            .setDescription('Second user mention, username, or ID')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('stats')
        .setDescription('Show bot stats')
    )
    .addSubcommand(sub =>
      sub.setName('reloadcommands')
        .setDescription('Reload slash commands')
    )
    .addSubcommand(sub =>
      sub.setName('blacklist')
        .setDescription('Manage blacklist')
        .addStringOption(opt =>
          opt.setName('action')
            .setDescription('add/remove/list')
            .setRequired(true)
            .addChoices(
              { name: 'add', value: 'add' },
              { name: 'remove', value: 'remove' },
              { name: 'list', value: 'list' }
            )
        )
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('User mention, username, or ID to add/remove (not needed for list)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('say')
        .setDescription('Send a message as the bot in a channel')
        .addStringOption(opt =>
          opt.setName('channelid')
            .setDescription('Channel ID to send message in')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('message')
            .setDescription('Message to send')
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({ content: '❌ You are not an admin.', flags: 64 });
    }
    if (isBlacklisted(interaction.user.id)) {
      return interaction.reply({ content: '❌ You are blacklisted from admin actions.', flags: 64 });
    }
    const sub = interaction.options.getSubcommand();
    if (sub === 'addadmin') {
      const userInput = interaction.options.getString('user');
      const user = await resolveUser(userInput, interaction.client);
      if (!user) return interaction.reply({ content: '❌ User not found.', flags: 64 });
      if (addAdmin(user.id)) {
        await interaction.reply({ content: `✅ Added <@${user.id}> as admin.`, flags: 64 });
      } else {
        await interaction.reply({ content: `⚠️ <@${user.id}> is already an admin.`, flags: 64 });
      }
    } else if (sub === 'removeadmin') {
      const userInput = interaction.options.getString('user');
      const user = await resolveUser(userInput, interaction.client);
      if (!user) return interaction.reply({ content: '❌ User not found.', flags: 64 });
      if (removeAdmin(user.id)) {
        await interaction.reply({ content: `✅ Removed <@${user.id}> from admins.`, flags: 64 });
      } else {
        await interaction.reply({ content: `⚠️ <@${user.id}> is not an admin.`, flags: 64 });
      }
    } else if (sub === 'listadmins') {
      const admins = getAdmins();
      await interaction.reply({ content: `👑 Admins:\n${admins.map(id => `<@${id}> (${id})`).join('\n')}`, flags: 64 });
    } else if (sub === 'dm') {
      const userInput = interaction.options.getString('user');
      const message = interaction.options.getString('message');
      const user = await resolveUser(userInput, interaction.client);
      if (!user) return interaction.reply({ content: '❌ User not found.', flags: 64 });
      try {
        await user.send(message);
        await interaction.reply({ content: `✅ DM sent to <@${user.id}>.`, flags: 64 });
      } catch (e) {
        await interaction.reply({ content: `❌ Failed to DM <@${user.id}>.`, flags: 64 });
      }
    } else if (sub === 'broadcast') {
      const message = interaction.options.getString('message');
      let deferred = false;
      try {
        await interaction.deferReply({ flags: 64 });
        deferred = true;
        const vibeProfiles = await getVibeProfiles();
        let count = 0;
        for (const userId of vibeProfiles.keys()) {
          try {
            const user = await interaction.client.users.fetch(userId);
            await user.send(message);
            count++;
          } catch {}
        }
        await interaction.editReply({ content: `✅ Broadcast sent to ${count} users.` });
      } catch (e) {
        try {
          if (deferred) {
            await interaction.editReply({ content: '❌ Failed to broadcast message.' });
          } else {
            await interaction.reply({ content: '❌ Failed to broadcast message.' });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
        return;
      }
    } else if (sub === 'userinfo') {
      const userInput = interaction.options.getString('user');
      const user = await resolveUser(userInput, interaction.client);
      if (!user) return interaction.reply({ content: '❌ User not found.', flags: 64 });
      const vibeProfiles = await getVibeProfiles();
      const profile = vibeProfiles.get(user.id);
      const admin = isAdmin(user.id);
      const blacklisted = isBlacklisted(user.id);
      await interaction.reply({ content: `User: <@${user.id}> (${user.id})\nAdmin: ${admin}\nBlacklisted: ${blacklisted}\nProfile: ${profile ? JSON.stringify(profile, null, 2) : 'None'}`, flags: 64 });
    } else if (sub === 'removeprofile') {
      const userInput = interaction.options.getString('user');
      let deferred = false;
      try {
        await interaction.deferReply({ flags: 64 });
        deferred = true;
        const user = await resolveUser(userInput, interaction.client);
        if (!user) return await interaction.editReply({ content: '❌ User not found.' });
        const vibeProfiles = await getVibeProfiles();
        if (vibeProfiles.has(user.id)) {
          vibeProfiles.delete(user.id);
          await saveVibeProfiles();
          await interaction.editReply({ content: `✅ Removed profile for <@${user.id}>.` });
        } else {
          await interaction.editReply({ content: `⚠️ No profile found for <@${user.id}>.` });
        }
      } catch (e) {
        try {
          if (deferred) {
            await interaction.editReply({ content: '❌ Failed to remove profile.' });
          } else {
            await interaction.reply({ content: '❌ Failed to remove profile.' });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
        return;
      }
    } else if (sub === 'forcematch') {
      const userInput1 = interaction.options.getString('user1');
      const userInput2 = interaction.options.getString('user2');
      let deferred = false;
      try {
        await interaction.deferReply({ flags: 64 });
        deferred = true;
        const user1 = await resolveUser(userInput1, interaction.client);
        const user2 = await resolveUser(userInput2, interaction.client);
        if (!user1 || !user2) return await interaction.editReply({ content: '❌ One or both users not found.' });
        matchedPairs[user1.id] = { matchedUserId: user2.id };
        matchedPairs[user2.id] = { matchedUserId: user1.id };
        await interaction.editReply({ content: `✅ Matched <@${user1.id}> and <@${user2.id}>.` });
        try {
          await user1.send(`🔔 You have been force-matched with <@${user2.id}> by an admin! Use /reveal to connect.`);
          await user2.send(`🔔 You have been force-matched with <@${user1.id}> by an admin! Use /reveal to connect.`);
        } catch {}
      } catch (e) {
        try {
          if (deferred) {
            await interaction.editReply({ content: '❌ Failed to force match users.' });
          } else {
            await interaction.reply({ content: '❌ Failed to force match users.' });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
        return;
      }
    } else if (sub === 'stats') {
      const vibeProfiles = await getVibeProfiles();
      const numProfiles = vibeProfiles.size;
      const numAdmins = getAdmins().length;
      const numBlacklisted = getBlacklist().length;
      await interaction.reply({ content: `📊 Bot Stats:\nProfiles: ${numProfiles}\nAdmins: ${numAdmins}\nBlacklisted: ${numBlacklisted}`, flags: 64 });
    } else if (sub === 'reloadcommands') {
      let deferred = false;
      try {
        await interaction.deferReply({ flags: 64 });
        deferred = true;
        await interaction.client.application.commands.set(interaction.client.commandsArray);
        await interaction.editReply({ content: '✅ Commands reloaded.' });
      } catch (e) {
        try {
          if (deferred) {
            await interaction.editReply({ content: '❌ Failed to reload commands.' });
          } else {
            await interaction.reply({ content: '❌ Failed to reload commands.' });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
        return;
      }
    } else if (sub === 'blacklist') {
      const action = interaction.options.getString('action');
      const userInput = interaction.options.getString('user');
      let user = null;
      if (userInput) user = await resolveUser(userInput, interaction.client);
      if (action === 'add') {
        if (!user) return interaction.reply({ content: 'User required or not found.', flags: 64 });
        if (addBlacklist(user.id)) {
          await interaction.reply({ content: `✅ Blacklisted <@${user.id}>.`, flags: 64 });
        } else {
          await interaction.reply({ content: `⚠️ <@${user.id}> is already blacklisted.`, flags: 64 });
        }
      } else if (action === 'remove') {
        if (!user) return interaction.reply({ content: 'User required or not found.', flags: 64 });
        if (removeBlacklist(user.id)) {
          await interaction.reply({ content: `✅ Removed <@${user.id}> from blacklist.`, flags: 64 });
        } else {
          await interaction.reply({ content: `⚠️ <@${user.id}> is not blacklisted.`, flags: 64 });
        }
      } else if (action === 'list') {
        const list = getBlacklist();
        await interaction.reply({ content: `🚫 Blacklisted Users:\n${list.map(id => `<@${id}> (${id})`).join('\n') || 'None'}`, flags: 64 });
      }
    } else if (sub === 'say') {
      const channelId = interaction.options.getString('channelid');
      const message = interaction.options.getString('message');
      let deferred = false;
      try {
        await interaction.deferReply({ flags: 64 });
        deferred = true;
        const channel = await interaction.client.channels.fetch(channelId);
        await channel.send(message);
        await interaction.editReply({ content: `✅ Message sent in <#${channelId}>.` });
      } catch (e) {
        try {
          if (deferred) {
            await interaction.editReply({ content: `❌ Failed to send message in <#${channelId}>.` });
          } else {
            await interaction.reply({ content: `❌ Failed to send message in <#${channelId}>.` });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
        return;
      }
    }
  }
}; 