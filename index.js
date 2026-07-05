const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// Environment variables
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = "1505121881370529913"; // Your client ID

if (!TOKEN) {
  console.error("【警告】環境変数 'DISCORD_TOKEN' が設定されていません。");
}

// Web server for Render's keep-alive
const app = express();
app.get('/', (req, res) => res.send('Bot is online!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webサーバー起動: ポート ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Command definition (/kura)
const commands = [
  new SlashCommandBuilder()
    .setName('kura')
    .setDescription('指定のメッセージを6回送信します')
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

// Message to send
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
    const channel = interaction.channel;
    if (!channel) return;

    // 【執着処理 1】Discordへの最初の返答を試みるが、
    // もしRenderの起動遅延で3秒を過ぎて「10062 Unknown interaction」エラーになっても
    // catchでエラーを握りつぶして、後続の送信ループ処理を絶対に止めない。
    try {
      await interaction.reply({
        content: "連投を開始します...",
        ephemeral: true
      });
    } catch (e) {
      console.log("Discordの3秒制限により初期応答はエラーになりましたが、送信処理を強制続行します:", e.message);
    }

    // 【執着処理 2】interaction（返答システム）を一切使わず、
    // チャンネルに対して直接「channel.send」を2秒間隔で「6回」連続で叩き込む。
    // これにより、タイムアウトが発生していようがいまいが、起動した瞬間にメッセージが6回届きます。
    for (let i = 0; i < 6; i++) {
      try {
        await channel.send({
          content: KURA_MESSAGE,
          allowedMentions: { parse: ["everyone"] } // 毎回確実に@everyoneを飛ばす
        });
        console.log(`${i + 1}回目の送信成功`);
      } catch (sendError) {
        console.error(`${i + 1}回目の送信失敗:`, sendError.message);
      }

      // 2秒（2000ミリ秒）の間隔を空ける
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
});

// Log in
if (TOKEN) {
  client.login(TOKEN).catch(err => {
    console.error("ログイン失敗:", err.message);
  });
}
