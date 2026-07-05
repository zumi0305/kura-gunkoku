const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

// 1. ボットの基本設定（インテント設定）
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

// 2. 【設定】/kura コマンド1回につき送信したいメッセージの総数（ここで回数を変更！）
const MESSAGE_COUNT = 6;

// 3. 送信するメッセージの内容（@everyoneを追加しました）
const SEND_MESSAGE = "@everyone kura ON TOP‼️ https://discord.gg/bgZYs5aZRz";

// Renderの環境変数からトークンとクライアントIDを読み込み
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

// コマンドが打たれた時の処理（インタラクション）
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        // 1通目のメッセージ（コマンドに対する返答）
        await interaction.reply({ 
            content: SEND_MESSAGE, 
            allowedMentions: { parse: ["everyone"] }, 
            ephemeral: false 
        });

        // 2通目以降のメッセージをループで連続送信
        for (let i = 2; i <= MESSAGE_COUNT; i++) {
            await interaction.channel.send({
                content: SEND_MESSAGE,
                allowedMentions: { parse: ["everyone"] }
            });
        }
    }
});

client.login(TOKEN);
