const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

const MESSAGE_COUNT = 6;
const SEND_MESSAGE = "@everyone kura ON TOP‼️ https://discord.gg/bgZYs5aZRz";

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 

const commands = [
    {
        name: 'kura',
        description: 'メッセージを連続で送信します',
    },
];

// 待ち時間（ミリ秒）を作るための関数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

client.once('ready', async () => {
    console.log(`ログインしました: ${client.user.tag}`);
    if (!TOKEN || !CLIENT_ID) return;

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('スラッシュコマンドの登録に成功しました！');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        try {
            // 3秒ルール対策
            await interaction.deferReply({ ephemeral: false });

            // 1通目
            await interaction.editReply({ 
                content: SEND_MESSAGE, 
                allowedMentions: { parse: ["everyone"] }
            });

            const channel = interaction.channel;
            if (!channel) return;

            // 2通目〜6通目：Discordのブロックを回避できる限界の速度（0.6秒間隔）で送信
            for (let i = 2; i <= MESSAGE_COUNT; i++) {
                await sleep(600); // 0.6秒だけ待つ（これより速いとDiscordに消されます）
                await channel.send({
                    content: SEND_MESSAGE,
                    allowedMentions: { parse: ["everyone"] }
                }).catch(err => console.error(`${i}通目の送信エラー:`, err));
            }

        } catch (error) {
            console.error("コマンド処理中にエラー:", error);
        }
    }
});

if (TOKEN) {
    client.login(TOKEN).catch(err => console.error("ログイン失敗:", err));
}
