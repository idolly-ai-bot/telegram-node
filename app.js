const TelegramBot = require('node-telegram-bot-api');
const Filter = require('bad-words')
const fs = require('fs');

require("dotenv").config();

const filter = new Filter();
const token = process.env.BOT_API;
const bot = new TelegramBot(token, { polling: true });


// 필터링 기능
function filtering(text) {

    const isFilter = filter.isProfane(text);

    if (isFilter) {
        return true;
    } else {
        return false;
    }
}

const welcomeMessages = {};


function setWelcome(chatId, message) {
    welcomeMessages[chatId] = message;
}


async function isAdmin(chatId, userId) {
    try {
        const administrators = await bot.getChatAdministrators(chatId);
        return administrators.some(admin => admin.user.id === userId);
    } catch (error) {
        console.error('Error occurred while checking admin status:', error);
        return false;
    }
}

// Matches "/setwelcome [message]"
bot.onText(/\/setwelcome (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const message = match[1];

    // Check if the user is an administrator
    const isAdministrator = await isAdmin(chatId, userId);
    if (!isAdministrator) {
        bot.sendMessage(chatId, 'You are not an administrator.');
        return;
    }

    setWelcome(chatId, message);
    bot.sendMessage(chatId, 'Welcome message set successfully!');
});

// Listen for new users joining a group
bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;
    const welcomeMessage = welcomeMessages[chatId] || 'Welcome to the group!';
    const username = newMembers[0].username ? `@${newMembers[0].username}` : `(${newMembers[0].id})`;

    // Send image
    const imageFilePath = 'images/logo.png'; // Path to your image
    fs.readFile(imageFilePath, (err, data) => {
        if (err) {
            console.error('Error reading image file:', err);
            return;
        }
        bot.sendPhoto(chatId, data, {
            caption: `
${welcomeMessage.replace('{username}', username)}
🔥 Everything is operated honestly
🔥 No private sale, No presale, A fair start
`,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Website', url: 'https://idolly.ai' },
                        { text: 'Discord', url: 'https://discord.gg/ajAeJ7YFNw' }
                    ],
                    [
                        { text: 'Twitter', url: 'https://twitter.com/idollyAI' },
                        { text: 'Instagram', url: 'https://www.instagram.com/idolly.ai' }
                    ]
                ]
            }
        });
    });
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});
