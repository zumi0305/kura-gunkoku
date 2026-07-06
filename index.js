const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Renderの稼働維持用 Webサーバー
app.get('/', (req, res) => {
    res.send('Bot is running!');
});
app.listen(PORT, () => {
    console.log(`Webサーバーがポート ${PORT} で起動しました`);
});

// Discordのインテンツ（権限）を確実にすべて受け取る設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const commands = [
    {
        name: 'kura',
        description: '連投を開始します'
    }
];

const token = process.env.DISCORD_TOKEN;

// 警告を解決するため 'clientReady' を使用
client.once('clientReady', async () => {
    console.log(`ログイン完了: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        console.log('スラッシュコマンドを登録中...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('スラッシュコマンドの登録が完了しました！');
    } catch (error) {
        console.error(error);
    }
});

// コマンドを受け取ったときの処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        const KURA_MESSAGE = `# KURA ON TOP‼️　@everyone \n\nkura ON TOP‼️ https://discord.gg/bgZYs5aZRz\nkura ON TOP‼️  https://discord.gg/bgZYs5aZRz\n# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけど🤣`;

        try {
            // 1. まずDiscordに「コマンドを受け付けた」という返事を返す（タイムアウト対策）
            await interaction.reply({ content: '連投を開始します...', ephemeral: true });

            // 2. チャンネルに通常メッセージとして連投
            for (let i = 0; i < 6; i++) {
                await interaction.channel.send({
                    content: KURA_MESSAGE,
                    allowedMentions: { parse: ['everyone'] }
                });
                // 2秒待機
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    }
});

client.login(token);
