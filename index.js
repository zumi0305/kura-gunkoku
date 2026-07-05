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
        // 全てのサーバー（グローバル）にスラッシュコマンドを即時反映して登録
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('スラッシュコマンドの登録に成功しました！');
    } catch (error) {
        console.error(error);
    }
});

// コマンドが打たれた時の処理（インタラクション）
client.on('interactionCreate', async interaction => {
    // スラッシュコマンド以外は無視
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        try {
            // 【重要】1通目を最速で返信して、このコマンドの受付を「完了」にする
            // これにより、すぐに次の「/kura」を打てるようになります
            await interaction.reply({ 
                content: SEND_MESSAGE, 
                allowedMentions: { parse: ["everyone"] }
            });

            // 2通目以降のメッセージをチャンネルに直接送信
            //（ここも設定を毎回しっかり引き継いで送るようにしています）
            for (let i = 2; i <= MESSAGE_COUNT; i++) {
                if (interaction.channel) {
                    interaction.channel.send({
                        content: SEND_MESSAGE,
                        allowedMentions: { parse: ["everyone"] }
                    }).catch(err => console.error("連投中にエラー:", err));
                }
            }

        } catch (error) {
            console.error("コマンド実行エラー:", error);
        }
    }
});

client.login(TOKEN);
