const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const ogs = require('open-graph-scraper');
require('dotenv').config();  // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3000;
const CHANNEL_ID = process.env.CHANNEL_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let cachedNews = [];

client.once('ready', () => {
    console.log('Discord bot is ready');
    fetchNews();
    setInterval(fetchNews, 60000); // Update every minute
});

async function fetchNews() {
    try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 10 });

        const fetchOGData = async (url) => {
            try {
                const { result } = await ogs({ url });
                return result;
            } catch (error) {
                console.error('Error fetching Open Graph data:', error);
                return null;
            }
        };

        cachedNews = await Promise.all(messages.map(async (message) => {
            const content = {
                title: message.author.username,
                description: message.content,
                url: message.url,
                messageID: message.id,
                channelID: message.channel.id,
                guildID: message.guild.id,
                attachments: [],
                embed: null
            };

            // Check for URLs in the message content
            const urlMatch = message.content.match(/\bhttps?:\/\/\S+/gi);
            if (urlMatch && urlMatch.length > 0) {
                const ogData = await fetchOGData(urlMatch[0]);
                if (ogData) {
                    content.embed = {
                        title: ogData.ogTitle || ogData.title,
                        description: ogData.ogDescription || ogData.description,
                        image: ogData.ogImage?.url || ogData.image,
                        url: ogData.ogUrl || urlMatch[0]
                    };
                }
            }

            message.attachments.forEach(attachment => {
                content.attachments.push({
                    url: attachment.url,
                    type: attachment.contentType.startsWith('image/') ? 'image' : 'video'
                });
            });

            return content;
        }));

        console.log('News updated:', cachedNews);
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

client.login(DISCORD_TOKEN).catch(console.error);

app.get('/news', (req, res) => {
    res.json(cachedNews);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
