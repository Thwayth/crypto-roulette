import asyncio
import os

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message


BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")


bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "Нажми /roulette, чтобы открыть рулетку."
    )


async def health(request):
    return web.Response(text="OK")


async def start_web_server():
    app = web.Application()

    app.router.add_get("/", health)
    app.router.add_get("/health", health)

    port = int(os.getenv("PORT", 10000))

    runner = web.AppRunner(app)
    await runner.setup()

    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()

    print(f"🌐 Web server запущен на порту {port}")


async def main():
    print("🤖 Бот запускается...")

    await start_web_server()

    print("🤖 Telegram polling запущен!")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
