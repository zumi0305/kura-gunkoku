const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// ==========================================
// 1. 設定項目（環境変数とクライアントID）
// ==========================================
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = "1522355079288455290"; // BotのアプリケーションID

// 起動時に環境変数が正しく読み込めているかチェック
if (!TOKEN) {
  console.error("【重大なエラー】環境変数 'DISCORD_TOKEN' が設定されていません。");
  console.error("Renderのダッシュボード ＞ Environment で 'DISCORD_TOKEN' を登録してください。");
}

// ==========================================
// 2. Webサーバー設定（Renderのスリープ対策用）
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('Botは正常に起動しています！'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[Webサーバー] ポート ${PORT} で起動完了`));

// ==========================================
// 3. Discord Botの初期化
// ==========================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==========================================
// 4. スラッシュコマンド（/kura）の登録処理
// ==========================================
const commands = [
  new SlashCommandBuilder()
    .setName('kura')
    .setDescription('指定のメッセージを2秒間隔で10回送信します（連投制限対策済）')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN || '');

(async () => {
  try {
    if (TOKEN) {
      console.log('スラッシュコマンドをDiscordに登録中...');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('【成功】スラッシュコマンドの登録が完了しました！');
    }
  } catch (error) { 
    console.error('【エラー】コマンド登録中に問題が発生しました:', error); 
  }
})();

// ==========================================
// 5. Botのアクション・イベント処理
// ==========================================
const KURA_MESSAGE = `　@everyone
# KURA ON TOP‼️　 https://discord.gg/7nEhftS3d3`;

// Botがオンラインになったらログを出す
client.once('ready', () => {
  console.log(`【成功】ログイン完了: ${client.user.tag}`);
});

// コマンドが実行された時の処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- /kura コマンドの実行 ---
  if (interaction.commandName === 'kura') {
    // 最初の1回目を送信
    await interaction.reply(KURA_MESSAGE);
    
    // 残り9回を2秒ごとに安全に送信（DiscordからのBAN・スパム制限対策）
    for (let i = 0; i < 9; i++) {
      // 2000ミリ秒（2秒）待機する
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try { 
        await interaction.followUp(KURA_MESSAGE); 
      } catch (e) { 
        console.error("連投エラーまたは制限がかかりました:", e.message);
        break; // エラーが出たら途中で安全にストップする
      }
    }
  }
});

// ==========================================
// 6. Discordへのログイン実行
// ==========================================
if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("【ログイン失敗】トークンが無効、または間違っています:", err.message);
  });
}
