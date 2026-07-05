const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

// 1. ボットの基本設定
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. 【設定】/kura コマンド1回につき送信したいメッセージの総数
const MESSAGE_COUNT = 3;

// Renderの環境変数からトークンとクライアントIDを読み込みます
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 

// 3. スラッシュコマンドの設定（/kura）
const commands = [
    {
        name: 'kura',
        description: 'お知らせメッセージを連続で送信します',
    },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

// 4. ボット起動時＆コマンド登録
client.once('ready', async () => {
    console.log(`ログインしました: ${client.user.tag}`);
    try {
        console.log('スラッシュコマンドを登録中...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('スラッシュコマンドの登録に成功しました！');
    } catch (error) {
        console.error(error);
    }
});

// 5. コマンドが打たれた時の処理（インタラクション）
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'kura') {
        // 1通目のメッセージ（コマンドに対する「返答」）
        await interaction.reply({ 
            content: "@everyone kura ON TOP‼️ https://discord.gg/bgZYs5aZRz
kura ON TOP‼️  https://discord.gg/bgZYs5aZRz
# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけど🤣`;", 
            allowedMentions: { parse: ['everyone'] }, 
            ephemeral: false 
        });

        // 2通目以降のメッセージをループで連続送信
        for (let i = 2; i <= MESSAGE_COUNT; i++) {
            await interaction.channel.send({
                content: "@everyone お知らせです！",
                allowedMentions: { parse: ['everyone'] }
            });
        }
    }
});

client.login(TOKEN);
