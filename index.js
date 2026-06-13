const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// 環境変数から設定を読み込む（GitHubにTOKENを晒さないための対策）
const TOKEN = MTUwNTEyMTg4MTM3MDUyOTkxMw.GoSqxg.SDCs7oLAfqm4-ktTZKzcVK3EC6TXQ1k6Jprb44; 
const CLIENT_ID = "1505121881370529913";
const TARGET_ROLE_ID = process.env.TARGET_ROLE_ID; 

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
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
});

// コマンドの定義
const commands = [
  new SlashCommandBuilder()
    .setName('kura')
    .setDescription('指定のメッセージを10回連投します'),
  new SlashCommandBuilder()
    .setName('kura2')
    .setDescription('特定のロール全員を1週間タイムアウトします'),
  new SlashCommandBuilder()
    .setName('kura_dm')
    .setDescription('特定のロール全員に例のメッセージをDMで送ります')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('コマンド登録完了！');
  } catch (error) { console.error(error); }
})();

// 送信するメッセージ
const KURA_MESSAGE = `# @everyone🔥💀 クラ軍国万歳 🙌 💀🔥\nhttps://discord.gg/ysJkMZQn`;

client.once('ready', () => console.log(`ログイン完了: ${client.user.tag}`));

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // --- /kura (連投) ---
  if (interaction.commandName === 'kura') {
    await interaction.reply(KURA_MESSAGE);
    for (let i = 0; i < 9; i++) {
      try { await interaction.followUp(KURA_MESSAGE); } catch (e) { break; }
    }
  }

  // --- /kura2 (一括タイムアウト) ---
  if (interaction.commandName === 'kura2') {
    await interaction.deferReply();
    const duration = 7 * 24 * 60 * 60 * 1000;
    try {
      const allMembers = await interaction.guild.members.fetch();
      const targets = allMembers.filter(m => m.roles.cache.has(TARGET_ROLE_ID));
      let count = 0;
      for (const [id, member] of targets) {
        try { await member.timeout(duration, 'kura2実行'); count++; } catch (err) {}
      }
      await interaction.editReply(`${count}名を1週間タイムアウトしました。`);
    } catch (e) { await interaction.editReply('エラーが発生しました。'); }
  }

  // --- /kura_dm (個別DM送信) ---
  if (interaction.commandName === 'kura_dm') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const allMembers = await interaction.guild.members.fetch();
      const targets = allMembers.filter(m => m.roles.cache.has(TARGET_ROLE_ID));
      let success = 0; let fail = 0;

      for (const [id, member] of targets) {
        if (member.user.bot) continue;
        try {
          await member.send(KURA_MESSAGE);
          success++;
        } catch (err) { fail++; }
      }
      await interaction.editReply(`DM送信完了。\n✅ 成功: ${success}名\n❌ 失敗: ${fail}名`);
    } catch (e) { await interaction.editReply('エラーが発生しました。'); }
  }
});

client.login(TOKEN);
