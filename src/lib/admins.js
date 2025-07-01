const fs = require('fs');
const path = require('path');

const ADMIN_FILE = path.join(__dirname, '../../data/admins.json');
const BLACKLIST_FILE = path.join(__dirname, '../../data/blacklist.json');

// Ensure the file exists and has the initial admin
function ensureAdminFile() {
  if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(["1285031503079804959"], null, 2));
  }
}

function getAdmins() {
  ensureAdminFile();
  const data = fs.readFileSync(ADMIN_FILE, 'utf8');
  return JSON.parse(data);
}

function saveAdmins(admins) {
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admins, null, 2));
}

function isAdmin(userId) {
  return getAdmins().includes(userId);
}

function addAdmin(userId) {
  const admins = getAdmins();
  if (!admins.includes(userId)) {
    admins.push(userId);
    saveAdmins(admins);
    return true;
  }
  return false;
}

function removeAdmin(userId) {
  // Prevent the owner from being removed
  if (userId === '1285031503079804959') {
    return false;
  }
  let admins = getAdmins();
  if (admins.includes(userId)) {
    admins = admins.filter(id => id !== userId);
    saveAdmins(admins);
    return true;
  }
  return false;
}

function ensureBlacklistFile() {
  if (!fs.existsSync(BLACKLIST_FILE)) {
    fs.writeFileSync(BLACKLIST_FILE, JSON.stringify([], null, 2));
  }
}

function getBlacklist() {
  ensureBlacklistFile();
  const data = fs.readFileSync(BLACKLIST_FILE, 'utf8');
  return JSON.parse(data);
}

function saveBlacklist(list) {
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(list, null, 2));
}

function addBlacklist(userId) {
  const list = getBlacklist();
  if (!list.includes(userId)) {
    list.push(userId);
    saveBlacklist(list);
    return true;
  }
  return false;
}

function removeBlacklist(userId) {
  let list = getBlacklist();
  if (list.includes(userId)) {
    list = list.filter(id => id !== userId);
    saveBlacklist(list);
    return true;
  }
  return false;
}

function isBlacklisted(userId) {
  return getBlacklist().includes(userId);
}

module.exports = {
  getAdmins,
  isAdmin,
  addAdmin,
  removeAdmin,
  getBlacklist,
  addBlacklist,
  removeBlacklist,
  isBlacklisted
}; 