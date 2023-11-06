export function generateRandomUsername() {
  const adjectives = [
      'Mighty', 'Brave', 'Swift', 'Clever', 'Bright', 
      'Mysterious', 'Grand', 'Lively', 'Calm', 'Bold', 
      'Fierce', 'Gentle', 'Silent', 'Loud', 'Shiny', 
      'Dull', 'Ancient', 'Modern', 'Quick', 'Slow'
  ];
  const nouns = [
      'Lion', 'Eagle', 'Shark', 'Puma', 'Owl', 
      'Hawk', 'Tiger', 'Bear', 'Fox', 'Wolf', 
      'Dolphin', 'Horse', 'Dragon', 'Snake', 'Elephant', 
      'Panther', 'Giraffe', 'Rabbit', 'Whale', 'Narwhal', 'Penguin'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000000000000001);
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}