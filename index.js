const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// =================【設定エリア】=================
// あなたのボットのトークン（Renderの環境変数 DISCORD_TOKEN に設定してください）
const TOKEN = process.env.DISCORD_TOKEN; 

// 🚨 ここにあなたのクライアントID（Application ID）を貼り付けてください！
const CLIENT_ID = "1522355079288455290"; 
// ===============================================

if (!TOKEN) {
  console.error("【警告】環境変数 'DISCORD_TOKEN' が設定されていません。");
}

// Webサーバー（Renderのスリープ対策用）
const app = Webサーバー起動 = express();
app.get('/', (req, res) => res.send('Bot is online!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webサーバー起動: ポート ${PORT}`));

// Discord Botの設定
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンドの定義
const commands = [
  new SlashCommandBuilder()
    .setName('kura')
    .setDescription('指定のメッセージを間隔を空けて10回送信します')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    if (TOKEN && CLIENT_ID && CLIENT_ID !== "ここにあなたのクライアントIDを入れる") {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('スラッシュコマンドの登録が完了しました！');
    } else {
      console.error("【エラー】CLIENT_ID が正しく設定されていないため、コマンド登録をスキップしました。");
    }
  } catch (error) { 
    console.error('コマンド登録中にエラーが発生しました:', error); 
  }
})();

// 送信するメッセージ
const KURA_MESSAGE = `# KURA ON TOP‼️　@everyone 

kura ON TOP‼️ https://discord.gg/bgZYs5aZRz
kura ON TOP‼️  https://discord.gg/bgZYs5aZRz
# Kuraに入らないなら、ネットやめてください🤣チー牛が減っても誰も心配しませんよ🤣親は、チー牛に取り柄がなくなって心配するかもしれないけど🤣`;

client.once('ready', () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'kura') {
    try {
      // 1回目のメッセージ（返頭）
      await interaction.reply({
        content: KURA_MESSAGE,
        allowedMentions: { parse: ["everyone"] }
      });
      
      const channel = interaction.channel;
      if (!channel) return;

      // 残り9回を2秒ごとに安全に送信（followUp制限を回避）
      for (let i = 0; i < 9; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await channel.send({
          content: KURA_MESSAGE,
          allowedMentions: { parse: ["everyone"] }
        }).catch(e => {
          console.error("送信エラー:", e.message);
        });
      }
    } catch (error) {
      console.error("コマンド処理中にエラーが発生しました:", error);
    }
  }
});

if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("ログイン失敗:", err.message);
  });
}
