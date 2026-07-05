const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

// 1. ボットの基本設定
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

// 2. 【設定】/kura コマンド1回につき送信したいメッセージの総数
const MESSAGE_COUNT = 3;

// 3. 送信するメッセージの内容
const SEND_MESSAGE = "@everyone kura ON TOP‼️ https://discord.gg/bgZYs5aZRz";

// Renderの環境変数から読み込み
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 

// スラッシュコマンドの設定（/kura）
const commands = [
    {
        name: 'kura',
        description: 'メッセージを連続で送信します',
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

// 待ち時間を作るための関数（ミリ秒指定）
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ボット起動時＆コマンド登録
client.once('ready', async () => {
    console.log(`ログインしました: ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('スラッシュコマンドの登録に成功しました！');
    } catch (error) {
        console.error(error);
    }
});

// コマンドが打たれた時の処理（インタラクション）
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        try {
            // 1通目のメッセージ（コマンドに対する返答）を確定させる
            await interaction.reply({ 
                content: SEND_MESSAGE, 
                allowedMentions: { parse: ["everyone"] }, 
                ephemeral: false 
            });

            // 1通目が確実に送信されるまで少し待つ（0.5秒）
            await sleep(500);

            // 2通目以降のメッセージをループで連続送信
            for (let i = 2; i <= MESSAGE_COUNT; i++) {
                if (interaction.channel) {
                    await interaction.channel.send({
                        content: SEND_MESSAGE,
                        allowedMentions: { parse: ["everyone"] }
                    });
                    // 連投によるDiscord側の制限を回避するため、送信ごとに少し間隔を空ける（0.3秒）
                    await sleep(300);
                }
            }
        } catch (error) {
            console.error("メッセージ送信中にエラーが発生しました:", error);
        }
    }
});

client.login(TOKEN);
