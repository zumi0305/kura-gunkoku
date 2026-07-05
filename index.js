const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// =================【設定エリア】=================
// あなたのボットのトークン（Renderの環境変数 DISCORD_TOKEN に設定してください）
const TOKEN = process.env.DISCORD_TOKEN; 

// 🚨 ここにあなたの正しいクライアントID（Application ID）を貼り付けてください！
const CLIENT_ID = "1505121881370529913"; 
// ===============================================

if (!TOKEN) {
  console.error("【警告】環境変数 'DISCORD_TOKEN' が設定されていません。");
}

// Webサーバー（Renderのスリープ対策用）
const app = express();
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
    .setDescription('メッセージを連続で送信します')
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

// 送信するメッセージ（固定内容）
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
      // 1回目のメッセージ（返答として即座に送信）
      await interaction.reply({
        content: KURA_MESSAGE,
        allowedMentions: { parse: ["everyone"] } // @everyone を有効化
      });
      
      const channel = interaction.channel;
      if (!channel) return;

      // 残り5回（合計6回になるようループを設定）を送信
      // 送信を成功させるため、Discordのレート制限を回避する1.5秒（1500ミリ秒）の間隔を空けます
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // channel.send を使用して確実にメッセージを送り込む
        await channel.send({
          content: KURA_MESSAGE,
          allowedMentions: { parse: ["everyone"] } // 毎回 @everyone を有効化
        }).catch(e => {
          console.error(`${i + 2}通目の送信エラー:`, e.message);
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
