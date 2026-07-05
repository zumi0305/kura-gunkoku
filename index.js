const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// 環境変数から設定を読み込む
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = "1505121881370529913";

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
    .setDescription('指定のメッセージを間隔を空けて10回送信します')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    if (TOKEN) {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('スラッシュコマンドの登録が完了しました！');
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
      // 1回目のメッセージ（コマンドへの返答）
      await interaction.reply({
        content: KURA_MESSAGE,
        allowedMentions: { parse: ["everyone"] } // @everyoneを有効化
      });
      
      const channel = interaction.channel;
      if (!channel) return;

      // 残り9回を2秒ごとに安全に送信
      for (let i = 0; i < 9; i++) {
        // 2秒（2000ミリ秒）待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 【修正】followUpではなく、チャンネルに直接通常メッセージとして送信
        await channel.send({
          content: KURA_MESSAGE,
          allowedMentions: { parse: ["everyone"] } // 毎回@everyoneを有効化
        }).catch(e => {
          console.error("送信エラー:", e.message);
        });
      }
    } catch (error) {
      console.error("コマンド処理中にエラーが発生しました:", error);
    }
  }
});

// ログイン実行
if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("ログイン失敗:", err.message);
  });
}
