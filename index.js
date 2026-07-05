const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// =================【設定エリア】=================
// Renderの環境変数が「DISCORD_TOKEN」でも「TOKEN」でも、どちらからでも自動で読み込みます
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN; 

// 🚨 あなたのクライアントID（Application ID）
const CLIENT_ID = "1522355079288455290"; 
// ===============================================

// Webサーバー（Renderのスリープ対策用：ポートが空いていれば起動します）
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webサーバー起動: ポート ${PORT}`)).on('error', (err) => {
  console.log("Webサーバーの起動をスキップ、または既存のサーバーを利用します:", err.message);
});

// Discord Botの設定（必要なインテントを設定）
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンドの定義（/kura）
const commands = [
  new SlashCommandBuilder()
    .setName('kura')
    .setDescription('指定のメッセージを6回送信します')
].map(command => command.toJSON());

// ログイン完了後にスラッシュコマンドを登録する安全設計
client.once('ready', async () => {
  console.log(`ログイン完了: ${client.user.tag}`);

  if (!TOKEN) {
    console.error("【エラー】環境変数にTOKENが設定されていません。これ以上進めません。");
    return;
  }

  // ボットが確実にログインできた後に、コマンド登録を行います
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('スラッシュコマンドを登録中...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('スラッシュコマンドの登録が完了しました！');
  } catch (error) { 
    // もしここでエラーが出ても、ボットのログイン状態は維持されます！
    console.error('コマンド登録中にエラーが発生しましたが、ボットの稼働は継続します:', error.message); 
  }
});

// 送信するメッセージ
const KURA_MESSAGE = `# KURA ON TOP‼️　@everyone 

kura ON TOP‼️ https://discord.gg/bgZYs5aZRz
kura ON TOP‼️  https://discord.gg/bgZYs5aZRz
# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけど🤣`;

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'kura') {
    const channel = interaction.channel;
    if (!channel) return;

    // タイムアウト(10062)のエラーで処理が中断されないよう、try-catchで完全に保護
    try {
      await interaction.reply({
        content: "連投を開始します...",
        ephemeral: true
      });
    } catch (e) {
      console.log("Discordの応答期限(3秒)を超えたためエラーが出ましたが、送信処理は裏でそのまま続行します:", e.message);
    }

    // チャンネルに対して直接「channel.send」を2秒間隔で合計6回発射する
    for (let i = 0; i < 6; i++) {
      try {
        await channel.send({
          content: KURA_MESSAGE,
          allowedMentions: { parse: ["everyone"] } // 毎回@everyoneを有効化
        });
        console.log(`${i + 1}回目の送信成功`);
      } catch (sendError) {
        console.error(`${i + 1}回目の送信失敗:`, sendError.message);
      }

      // 2秒（2000ミリ秒）待機
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
});

// 最優先でまずログインを実行し、ボットをオンラインにします
if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("ログイン失敗:", err.message);
  });
} else {
  console.error("TOKENが見つからないためログインを開始できません。RenderのEnvironment設定を確認してください。");
}
