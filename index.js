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

// メンバー取得に必要なインテントを設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // ★これが必須です
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

// 起動処理
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
        console.error('コマンド登録エラー:', error);
    }
});

// コマンドを受け取ったときの処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // 共通メッセージ
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
            console.error('kuraエラー:', error);
        }
    }

    // --- /randommention コマンドの処理 ---
    if (interaction.commandName === 'randommention') {
        try {
            // 最初に応答を隠し状態で返す（これでInteractionがタイムアウトするのを防ぎます）
            await interaction.reply({ content: '実行中...', flags: [64] });

            let membersMap;
            try {
                // API制限対策：まずはキャッシュから高速取得を試みる
                membersMap = interaction.guild.members.cache;
                
                // キャッシュが少なすぎる場合はAPIから最新情報を取得する
                if (membersMap.size <= 1) {
                    membersMap = await interaction.guild.members.fetch({ time: 5000 }); // 5秒タイムアウト設定
                }
            } catch (fetchError) {
                console.error('メンバー取得でエラーが発生したためキャッシュで代用します:', fetchError);
                membersMap = interaction.guild.members.cache;
            }

            // ボット以外のユーザーをリスト化
            const members = Array.from(membersMap.values()).filter(member => !member.user.bot);

            if (members.length === 0) {
                return interaction.followUp({ content: 'メンションできるメンバーが見つかりませんでした。Botにサーバーメンバーの読み取り権限（ロール）があるか確認してください。', flags: [64] });
            }

            // 6回ループして毎回5人を選び連投
            for (let i = 0; i < 6; i++) {
                // 毎回シャッフルして5人選ぶ
                const shuffled = [...members].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, Math.min(5, members.length));

                // 5人のメンションを作成
                const mentions = selected.map(member => `<@${member.id}>`).join(' ');

                // メッセージを送信
                const randomMentionMessage = `# KURA ON TOP‼️　${mentions}\n\n${BASE_MESSAGE.replace('# KURA ON TOP‼️ \n\n', '')}`;

                await interaction.followUp({
                    content: randomMentionMessage,
                    allowedMentions: { parse: ['users'] }
                });

                if (i < 5) await new Promise(resolve => setTimeout(resolve, 30)); // 連投制限を避けるため少し間隔を広げました（300ms）
            }

        } catch (error) {
            console.error('randommention全体エラー:', error);
        }
    }
});

client.login(token);
