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

// メンバー一覧を取得するため GuildMembers インテントを追加
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // メンバー取得に必須
    ]
});

// コマンドの定義に 'randommention' を指定
const commands = [
    {
        name: 'kura',
        description: 'くらぐんこく！'
    },
    {
        name: 'randommention',
        description: 'サーバー内のメンバーからランダムに5人をメンションします。'
    }
];

const token = process.env.DISCORD_TOKEN;

// 正しいイベント名 'ready' に修正して起動処理を実行
client.once('ready', async () => {
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

    // --- /kura コマンドの処理 ---
    if (interaction.commandName === 'kura') {
        const KURA_MESSAGE = `# KURA ON TOP‼️　@everyone \n\nkura ON TOP‼️ https://discord.gg/bgZYs5aZRz\nkura ON TOP‼️  https://discord.gg/bgZYs5aZRz\n# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけどhttps://cdn.discordapp.com/attachments/1522914734540853269/1525298483853262898/POhbAYAla3VOLzBn5WZW1783138791-1783139069.gif?ex=6a52e069&is=6a518ee9&hm=7a2a392d6eee5182f3e605f7c2bd96328425da106f36638b086ee10a010f091d🤣`;

        try {
            await interaction.reply({ content: '‍', flags: [64] });

            for (let i = 0; i < 6; i++) {
                await interaction.followUp({
                    content: KURA_MESSAGE,
                    allowedMentions: { parse: ['everyone'] }
                });
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    }

    // --- /randommention コマンドの処理 ---
    if (interaction.commandName === 'randommention') {
        try {
            // 先に応答の準備（考え中...）をする
            await interaction.deferReply();

            // サーバーの全メンバーを動的に取得
            const membersMap = await interaction.guild.members.fetch();
            // ボット以外のメンバーを抽出
            const members = Array.from(membersMap.values()).filter(member => !member.user.bot);

            if (members.length === 0) {
                return interaction.editReply('メンションできるメンバーがいません。');
            }

            // ランダムにシャッフルして最大5人を抽出
            const shuffled = members.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 5);

            // 表示用の名前と、実際のメンション用タグ（内部で自動生成）を作成
            const names = selected.map(member => member.displayName).join(', ');
            const mentions = selected.map(member => `<@${member.id}>`).join(' ');

            // メンション付きで送信
            await interaction.editReply({
                content: `🎯 **ランダムに選ばれた5人:** ${names}\n${mentions}`,
                allowedMentions: { parse: ['users'] } // ユーザーメンションの動作を許可
            });

        } catch (error) {
            console.error('ランダムメンション中にエラーが発生しました:', error);
            await interaction.editReply('エラーが発生しました。ボットに「メンバー管理」権限や、Developer Portalでの「Server Members Intent」がONになっているか確認してください。');
        }
    }
});

client.login(token);
