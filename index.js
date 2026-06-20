const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// 環境変数から設定を読み込む
const TOKEN = process.env.DISCORD_TOKEN; 
const CLIENT_ID = "1517816126208479233";

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
    .setDescription('指定のメッセージを10回連投します')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('コマンド登録完了！');
  } catch (error) { console.error(error); }
})();

// 送信するメッセージ
const KURA_MESSAGE = `# @everyone🔥💀 チー牛乙！こんなくだらないサーバー抜けてクラ軍国に参加‼️クラ軍国万歳 🙌 💀🔥https://discord.gg/KW9fTH9F`;

client.once('ready', () => console.log(`ログイン完了: ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- /kura (連投) ---
  if (interaction.commandName === 'kura') {
    await interaction.reply(KURA_MESSAGE);
    for (let i = 0; i < 9; i++) {
      try { 
        await interaction.followUp(KURA_MESSAGE); 
      } catch (e) { 
        console.error("連投制限に達しました");
        break; 
      }
    }
  }
});

client.login(TOKEN);
