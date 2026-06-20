const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// 環境変数から設定を読み込む
const TOKEN = process.env;DISCORD_TOKEN 
const CLIENT_ID = "1517816126208479233";

// 起動時に環境変数が正しく読み込めているかチェックするログ
if (!TOKEN) {
  console.error("【警告】環境変数 'DISCORD_TOKEN' が設定されていません。Renderの設定を確認してください。");
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

// コマンドの定義（/kura のみ）
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
const KURA_MESSAGE = `# **KURA ON TOP　チー牛乙😹🤣　今すぐ最強のクラ軍国に参加‼️https://discord.gg/KW9fTH9F**`;

client.once('ready', () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- /kura コマンドの処理 ---
  if (interaction.commandName === 'kura') {
    // 最初の1回目を送信
    await interaction.reply(KURA_MESSAGE);
    
    // 残り9回を安全に送信（連投制限・BAN対策）
    for (let i = 0; i < 9; i++) {
    
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try { 
        await interaction.followUp(KURA_MESSAGE); 
      } catch (e) { 
        console.error("レートリミットまたはエラーにより送信を停止しました:", e.message);
        break; 
      }
    }
  }
});

// ログイン実行
if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("ログイン失敗:", err.message);
  });
}
