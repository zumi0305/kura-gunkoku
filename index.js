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

// ボット起動時＆コマンド登録
client.once('ready', async () => {
    console.log(`ログインしました: ${client.user.tag}`);
    
    // トークンとクライアントIDが読み込めているかチェック
    if (!TOKEN || !CLIENT_ID) {
        console.error("【エラー】Renderの環境変数(TOKENまたはCLIENT_ID)が設定されていません。");
        return;
    }

    // RESTインスタンスに確実にトークンをセットする
    const rest = new REST({ version: '10' }).setToken(TOKEN);

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
            // 3秒タイムアウト対策
            await interaction.deferReply({ ephemeral: false });

            // 1通目：最初の返答メッセージ
            await interaction.editReply({ 
                content: SEND_MESSAGE, 
                allowedMentions: { parse: ["everyone"] }
            });

            const channel = interaction.channel;
            if (!channel) return;

            // 2通目〜6通目：awaitを付けずに0秒で一気に送信を投げる
            for (let i = 2; i <= MESSAGE_COUNT; i++) {
                channel.send({
                    content: SEND_MESSAGE,
                    allowedMentions: { parse: ["everyone"] }
                }).catch(err => console.error(`${i}通目の送信エラー:`, err));
            }

        } catch (error) {
            console.error("コマンド処理中にエラー:", error);
        }
    }
});

// ログイン処理
if (TOKEN) {
    client.login(TOKEN).catch(err => console.error("ログイン失敗:", err));
} else {
    console.error("TOKENがありません。");
}
