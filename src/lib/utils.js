function getRandomCompliment() {
  const compliments = [
    'You rock!',
    'You are awesome!',
    'Keep being amazing!',
    'You make Discord better!',
    'Stay cool! 💎',
    'You brighten up the server!',
    'You are a star! ⭐',
    'You have great vibes!',
    'You are legendary!',
    'You are appreciated!'
  ];
  return compliments[Math.floor(Math.random() * compliments.length)];
}

module.exports = { getRandomCompliment }; 