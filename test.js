var Filter = require('bad-words')

const filter = new Filter();

const text = 'asshole fucking bitch';

const isProfane = filter.isProfane(text);

if (isProfane) {
    console.log('This sentence contains profanity!');
} else {
    console.log('This sentence is clean.');
}

// 텍스트에서 비속어를 필터링하여 대체합니다
const cleanText = filter.clean(text);
console.log('Cleaned text:', cleanText);



