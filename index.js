const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});
app.listen(PORT, () => {
    console.log(`Webサーバーがポート ${PORT} で起動しました`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const token = process.env.DISCORD_TOKEN;

// コマンドの定義（オプション指定なし）
const commands = [
    {
        name: 'kura',
        description: 'くらぐんこく！',
        integration_types: [0, 1], // 1: ユーザーインストールを許可
        contexts: [0, 1, 2]
    },
    {
        name: 'randommention',
        description: '自動的に周りのメンバーから5人をランダムに選んでメンションします。',
        integration_types: [0, 1], // 1: ユーザーインストールを許可
        contexts: [0, 2]          // サーバーとグループDM等
    }
];

client.once('ready', async () => {
    console.log(`ログイン完了: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('グローバルスラッシュコマンドの登録が完了しました！');
    } catch (error) {
        console.error('コマンド登録エラー:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const BASE_MESSAGE = `# KURA ON TOP‼️ \n\nkura ON TOP‼️ https://discord.gg/bgZYs5aZRz\nkura ON TOP‼️  https://discord.gg/bgZYs5aZRz\n# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけどhttps://cdn.discordapp.com/attachments/1522914734540853269/1525298483853262898/POhbAYAla3VOLzBn5WZW1783138791-1783139069.gif?ex=6a52e069&is=6a518ee9&hm=7a2a392d6eee5182f3e605f7c2bd96328425da106f36638b086ee10a010f091d🤣`;

    // --- /kura コマンド ---
    if (interaction.commandName === 'kura') {
        try {
            await interaction.reply({ content: '‍', flags: [64] });

            for (let i = 0; i < 6; i++) {
                await interaction.followUp({
                    content: `# KURA ON TOP‼️　@everyone \n\n${BASE_MESSAGE.replace('# KURA ON TOP‼️ \n\n', '')}`,
                    allowedMentions: { parse: ['everyone'] }
                });
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 200));
            }
        } catch (error) {
            console.error('kuraエラー:', error);
        }
    }

    // --- /randommention コマンド ---
    if (interaction.commandName === 'randommention') {
        try {
            // インタラクション切れ防止の初期応答
            await interaction.reply({ content: 'ターゲット検索中...', flags: [64] });

            let targets = [];

            // 1. コマンドが実行されたチャンネルのアクティブなメンバー（キャッシュ）からボットを除外して収集
            if (interaction.channel && interaction.channel.members) {
                const activeMembers = Array.from(interaction.channel.members.values())
                    .filter(member => !member.user.bot)
                    .map(member => member.user);
                targets.push(...activeMembers);
            }

            // 2. もしチャンネルから取得できない場合、直近のメッセージ送信者やInteractionを起動したユーザーを候補に含める
            if (targets.length === 0 && interaction.guild) {
                // スラッシュコマンド送信者本人を含む
                targets.push(interaction.user);
                
                // コマンド実行チャンネルの直近メッセージからユーザーをかき集める
                try {
                    const messages = await interaction.channel.messages.fetch({ limit: 50 });
                    const authors = messages
                        .filter(msg => !msg.author.bot)
                        .map(msg => msg.author);
                    targets.push(...authors);
                } catch (e) {
                    // 履歴取得権限がない場合はスルー
                }
            }

            // 重複するユーザーを削除
            const uniqueTargets = Array.from(new Map(targets.map(user => [user.id, user])).values());

            if (uniqueTargets.length === 0) {
                return interaction.followUp({ 
                    content: '❌ 周囲にメンション可能なアクティブユーザーが見つかりませんでした。', 
                    flags: [64] 
                });
            }

            await interaction.editReply({ content: '自動ランダムメンションを開始します！' });

            // 6回ループ
            for (let i = 0; i < 6; i++) {
                // 自動検知したメンバーをシャッフル
                const shuffled = [...uniqueTargets].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, Math.min(5, uniqueTargets.length));
                
                // 5人のメンションを作成
                const mentions = selected.map(user => `<@${user.id}>`).join(' ');

                const randomMentionMessage = `# KURA ON TOP‼️　${mentions}\n\n${BASE_MESSAGE.replace('# KURA ON TOP‼️ \n\n', '')}`;

                // 送信
                await interaction.followUp({
                    content: randomMentionMessage,
                    allowedMentions: { parse: ['users'] }
                }).catch(err => console.error('送信エラー(スルー):', err.message));

                if (i < 5) await new Promise(resolve => setTimeout(resolve, 300));
            }

        } catch (error) {
            console.error('randommentionエラー:', error);
        }
    }
});

client.login(token);
