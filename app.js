const TelegramBot = require('node-telegram-bot-api');
const Filter = require('bad-words');
const cron = require('node-cron');
const fs = require('fs');

require("dotenv").config();

const filter = new Filter();
const token = process.env.BOT_API;
const bot = new TelegramBot(token, { polling: true });


// 필터링 기능

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

function filtering(text) {
    return filter.isProfane(text);
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
    const imageFilePath = './images/Option1.png'; // Path to your image
    const stream = fs.createReadStream(imageFilePath);

    bot.sendPhoto(chatId, stream, {
            caption: `
${welcomeMessage.replace('{username}', username)}
🔥 Everything is operated honestly
🔥 No private sale, No presale, A fair start
🔥 purchase elite credit pack available if you like chat /package

❌ Don't act like this!
 - If you plaster it, you will be kicked out.
 - No profanity, no advertising
 - If you display inappropriate behavior, you will be expelled.

✅ Good Act
 - Clean Chat
 - Free Talking

 🔧 Options
 /package : info For purchase elite credit pack
 /link : links related to our services
 /event : ongoing Telegram event
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
                    ],
                    [
                        { text: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61557844051238' },
                        { text: 'Medium', url: 'https://medium.com/@idollymarketing' }
                    ],
                ]
            }
        });

});



// Listen for any kind of message. There are different kinds of
// messages.
const messageTracker = {}; // 각 사용자의 메시지 수를 추적하는 객체

// Listen for any kind of message and track user message frequency
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username;
    const messageText = msg.text;

    if (messageText === '/package') {
        bot.deleteMessage(chatId, msg.message_id);

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "elite credit pack", url: "https://forms.gle/Kd9h1QLdrdT3rckF7" }
                ]
            ]
        };
        const replyMarkup = JSON.stringify(keyboard);

        // https://forms.gle/qmd2bZnFdDcbDAjd8
        const otcMessage = "For bulk credit purchase, please contact our support team.";
        bot.sendMessage(chatId, "For purchase elite credit pack, please contact our support team.", {
            reply_markup: replyMarkup
        });
    } else if(messageText === "/link") {
        bot.deleteMessage(chatId, msg.message_id);
        const keyboard = {
            inline_keyboard: [
                [
                    { text: 'Website', url: 'https://idolly.ai' },
                    { text: 'Discord', url: 'https://discord.gg/H3Msa8ZwVJ' }
                ],
                [
                    { text: 'Twitter', url: 'https://twitter.com/idollyAI' },
                    { text: 'Instagram', url: 'https://www.instagram.com/idolly.ai' }
                ],
                [
                    { text: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61557844051238' },
                    { text: 'Medium', url: 'https://medium.com/@idollymarketing' }
                ],
            ]
        };
        const replyMarkup = JSON.stringify(keyboard);

        bot.sendMessage(chatId, "These are links related to our services.", {
            reply_markup: replyMarkup
        });

    } else if(messageText === "/event") {
        bot.deleteMessage(chatId, msg.message_id);
        bot.sendMessage(chatId, `There are no telegram events yet. There will be an event coming soon!`);

    } else  {
         // Initialize message count for the user if not exists
        if (!messageTracker[userId]) {
            messageTracker[userId] = {
                count: 0,
                lastTimestamp: Date.now() // 마지막 메시지의 타임스탬프
            };
        }

        const now = Date.now();
        const userMessageInfo = messageTracker[userId];

        // Check if 3 seconds have passed since the last message
        if (now - userMessageInfo.lastTimestamp > 3000) {
            // Reset message count if more than 3 seconds passed
            userMessageInfo.count = 0;
        }

        // Increment message count and update last message timestamp
        userMessageInfo.count++;
        userMessageInfo.lastTimestamp = now;


        // Check if message count exceeds the threshold (5 messages in 3 seconds)
        if (userMessageInfo.count > 5) {
            // Block user (You may implement your blocking logic here)

            const sendMessage = await bot.sendMessage(chatId, `User ${userName} has been blocked for flooding.`)

            setTimeout(() => {
                bot.deleteMessage(chatId, sendMessage.message_id);
            },1000)
        
            bot.banChatMember(chatId, userId);

    
        } else {
            // Process the message normally
            const messageText = msg.text;
            if (filtering(messageText)) {
                // 비속어가 감지되면 메시지를 차단
                bot.deleteMessage(chatId, msg.message_id);
                const data = await bot.sendMessage(chatId, `Your message contains inappropriate content and has been deleted. 
                If you send more inappropriate content, you may be blocked.`);
                setTimeout(() => {
                    bot.deleteMessage(chatId, data.message_id);
                },1000)


            }
        }

    }

   
});



// Index to keep track of current message
// // Schedule task to send message every 5 minutes
// const messages = [
//     'Message 1',
//     'Message 2',
//     'Message 3',
//     'Message 4',
//     'Message 5'
// ];
// let currentIndex = 0;
// cron.schedule('0 * * * *', () => { // Send message every hour at the beginning of the hour
//     // Get current message
//     const message = messages[currentIndex];
    
//     // Increment index for next message (with wrap-around)
//     currentIndex = (currentIndex + 1) % messages.length;
    
//     // Send message to all users
//     bot.sendMessage(-1002084874193, message);
// });