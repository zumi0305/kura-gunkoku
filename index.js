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

// 必要なインテンツをすべて指定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const commands = [
    {
        name: 'kura',
        description: '連投を開始します'
    }
];

const token = process.env.DISCORD_TOKEN;

// 警告を回避するため clientReady を使用
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
            // 1. 最初に応答を返す（文字だけを削除）
            await interaction.reply({ content: '‍', flags: [64] });

            // 2. interaction.followUp を使って同じチャンネルに安全に連投する
            for (let i = 0; i < 6; i++) {
                await interaction.followUp({
                    content: KURA_MESSAGE,
                    allowedMentions: { parse: ['everyone'] }
                });
                // 2秒待機
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    }
});

client.login(token);
