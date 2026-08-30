```python
import asyncio
import os
from pathlib import Path

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message


BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")


BASE_DIR = Path(__file__).resolve().parent

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Открой рулетку через Mini App."
    )


async def index(request):
    return web.FileResponse(BASE_DIR / "index.html")


async def javascript(request):
    return web.FileResponse(BASE_DIR / "app.js")


async def css(request):
    return web.FileResponse(BASE_DIR / "style.css")


async def health(request):
    return web.Response(text="OK")


async def start_web_server():
    app = web.Application()

    app.router.add_get("/", index)
    app.router.add_get("/index.html", index)
    app.router.add_get("/app.js", javascript)
    app.router.add_get("/style.css", css)
    app.router.add_get("/health", health)

    port = int(os.getenv("PORT", "10000"))

    runner = web.AppRunner(app)
    await runner.setup()

    site = web.TCPSite(
        runner,
        "0.0.0.0",
        port
    )

    await site.start()

    print(f"🌐 Web server запущен на порту {port}")


async def main():
    print("🤖 Бот запускается...")

    await start_web_server()

    print("🤖 Telegram polling запущен!")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
```
