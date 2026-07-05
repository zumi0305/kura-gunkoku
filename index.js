const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

// 1. ボットの基本設定（メッセージ送信を動かすための重要な設定）
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // サーバー内のメッセージを扱う設定
        GatewayIntentBits.MessageContent // メッセージの内容を扱う設定
    ] 
});

// 2. 【設定】/kura コマンド1回につき送信したいメッセージの総数（6回に変更）
const MESSAGE_COUNT = 6;

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

// コマンドが打たれた時の処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        try {
            // 1通目：コマンドに対する返答として送信
            await interaction.reply({ 
                content: SEND_MESSAGE, 
                allowedMentions: { parse: ["everyone"] }
            });

            // 2通目〜6通目：指定したチャンネルに直接メッセージを送信
            for (let i = 2; i <= MESSAGE_COUNT; i++) {
                // interaction.channel が正しく取得できているか確認して送信
                if (interaction.channel) {
                    await interaction.channel.send({
                        content: SEND_MESSAGE,
                        allowedMentions: { parse: ["everyone"] } // 2回目以降にも毎回everyoneを適用
                    });
                }
            }

        } catch (error) {
            console.error("送信エラーが発生しました:", error);
        }
    }
});

client.login(TOKEN);
