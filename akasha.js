require('dotenv/config');
const { Client, GatewayIntentBits, messageLink } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

console.log("Welcome to Teyvat.");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})
const openai = new OpenAIApi(configuration);

client.on("ready", () => {
    console.log('Logged in as ' + client.user.username)
});

client.on('messageCreate', async msg => {
    if (msg.author.bot) return;
    if (msg.channel.id !== process.env.CHANNEL_ID) return;

    let conversationLog = [{role: 'system', content: "Your name is Nahida."}]
    let prevMessages = await msg.channel.messages.fetch({ limit: 10});
    prevMessages.reverse();
    if (msg.content.startsWith('!')) {
        await msg.channel.sendTyping();

        prevMessages.forEach((message) => {
             if (message.author.id !== client.user.id && message.author.bot) return;
             if (message.author.id !== msg.author.id) return;
            
             conversationLog.push({
                role: 'user',
                content: message.content,
            })
        })
        const result = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
        })
        msg.reply(result.data.choices[0].message);
    }
    
    if (msg.content === "ping") {
        msg.reply("pong " + msg.member.user.username)
    }
})

client.login(process.env.TOKEN);