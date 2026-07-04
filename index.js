import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import Button, View

# 1. ボットの基本設定
intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

# 2. 【設定】ボタン1回につき送信したいメッセージの数
MESSAGE_COUNT = 6


# 3. ボタンの動作を定義するクラス
class InfiniteButtonView(View):
    def __init__(self):
        super().__init__(timeout=None)  # 無限に使える設定

    @discord.ui.button(label="ボタンを押してね！", style=discord.ButtonStyle.primary, custom_id="infinite_button")
    async def button_callback(self, interaction: discord.Interaction, button: discord.ui.Button):
        # 1通目のメッセージ
        await interaction.response.send_message("@everyone https://discord.gg/fNnqZescu **KURAONTOP　こんなサバ
よりクラ軍国に参加**　, ephemeral=False)
        
        # 2通目以降のメッセージをループで連続送信
        for _ in range(2, MESSAGE_COUNT + 1):
            await interaction.channel.send("@everyone https://discord.gg/fNnqZescu KURAONTOP　こんなサバ
よりクラ軍国に参加‼️")


# 4. ボット起動時＆スラッシュコマンドの同期
@bot.event
async def on_ready():
    print(f"ログインしました: {bot.user}")
    try:
        # 作成したスラッシュコマンドをDiscordに登録（同期）します
        synced = await bot.tree.sync()
        print(f"{len(synced)} 個のコマンドを同期しました。")
    except Exception as e:
        print(f"同期エラー: {e}")


# 5. /kura コマンドの設定
@bot.tree.command(name="kura", description="無限ボタン付きメッセージを送信します")
async def kura(interaction: discord.Interaction):
    view = InfiniteButtonView()
    # スラッシュコマンドへの返答としてボタン付きメッセージを送信
    await interaction.response.send_message("れんとーするならボタン！", view=view)


# 6. ボットの起動（トークンを入れてね）
bot.run("YOUR_BOT_TOKEN_HERE")
