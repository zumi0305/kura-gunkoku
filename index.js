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

// コマンドの定義
const commands = [
    {
        name: 'kura',
        description: 'くらぐんこく！'
    },
    {
        name: 'randommention',
        description: 'ランダムに5人をメンションしながら、連続で宣伝メッセージを送信します。'
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

    // 共通で使用するベースメッセージ
    const BASE_MESSAGE = `# KURA ON TOP‼️ \n\nkura ON TOP‼️ https://discord.gg/bgZYs5aZRz\nkura ON TOP‼️  https://discord.gg/bgZYs5aZRz\n# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけどhttps://cdn.discordapp.com/attachments/1522914734540853269/1525298483853262898/POhbAYAla3VOLzBn5WZW1783138791-1783139069.gif?ex=6a52e069&is=6a518ee9&hm=7a2a392d6eee5182f3e605f7c2bd96328425da106f36638b086ee10a010f091d🤣`;

    // --- /kura コマンドの処理 ---
    if (interaction.commandName === 'kura') {
        try {
            await interaction.reply({ content: '‍', flags: [64] });

            for (let i = 0; i < 6; i++) {
                await interaction.followUp({
                    content: `# KURA ON TOP‼️　@everyone \n\n${BASE_MESSAGE.replace('# KURA ON TOP‼️ \n\n', '')}`,
                    allowedMentions: { parse: ['everyone'] }
                });
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 20));
            }
        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
    }

    // --- /randommention コマンドの処理 ---
    if (interaction.commandName === 'randommention') {
        try {
            // 先に応答の準備をする
            await interaction.reply({ content: '‍', flags: [64] });

            // サーバーの全メンバーを取得
            const membersMap = await interaction.guild.members.fetch();
            // ボット以外のメンバーを抽出
            const members = Array.from(membersMap.values()).filter(member => !member.user.bot);

            if (members.length === 0) {
                return interaction.followUp({ content: 'メンションできるメンバーがいません。', flags: [64] });
            }

            // 6回ループして毎回ランダムに5人を選び、連投する
            for (let i = 0; i < 6; i++) {
                // 毎回新しくシャッフルして5人を選ぶ
                const shuffled = members.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 5);

                // 5人のメンション文字列を作成 (例: <@ID> <@ID> ...)
                const mentions = selected.map(member => `<@${member.id}>`).join(' ');

                // メッセージを構築
                const randomMentionMessage = `# KURA ON TOP‼️　${mentions}\n\n${BASE_MESSAGE.replace('# KURA ON TOP‼️ \n\n', '')}`;

                // メッセージの送信
                await interaction.followUp({
                    content: randomMentionMessage,
                    allowedMentions: { parse: ['users'] } // ユーザーメンションを有効化
                });

                // 連投の間に少しウェイトを挟む（200ミリ秒）
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 20));
            }

        } catch (error) {
            console.error('ランダムメンション中にエラーが発生しました:', error);
        }
    }
});

client.login(token);
