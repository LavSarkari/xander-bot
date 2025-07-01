// Shared state for Xander bot

const userNotes = new Map();
const userReminders = new Map();
const userConversations = new Map();
const translateCooldowns = new Map();

module.exports = {
  userNotes,
  userReminders,
  userConversations,
  translateCooldowns
}; 