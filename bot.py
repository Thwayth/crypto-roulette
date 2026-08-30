import os
import asyncio
import logging

from aiohttp import web
from aiogram import Bot, Dispatcher, Router
from aiogram.filters import CommandStart
from aiogram.types import Message

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
raise RuntimeError("BOT_TOKEN не найден в Environment Variables")

WEBAPP_URL = os.getenv("WEBAPP_URL", "")

router = Router()

@router.message(CommandStart())
async def start_handler(message: Message):
await message.answer(
"🎰 CRYPTO ROULETTE\n\n"
"Испытай удачу и получи ценный приз!"
)

async def health_handler(request):
return web.Response(text="OK")

async def create_app():
app = web.Application()
app.router.add_get("/", health_handler)
app.router.add_get("/health", health_handler)
return app

async def start_web_server():
app = await create_app()

```
port = int(os.getenv("PORT", "10000"))

runner = web.AppRunner(app)
await runner.setup()

site = web.TCPSite(
    runner,
    "0.0.0.0",
    port
)

await site.start()

logging.info("Web server started on port %s", port)

return runner
```

async def main():
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

```
dp.include_router(router)

runner = await start_web_server()

try:
    logging.info("Crypto Roulette bot started")
    await dp.start_polling(bot)
finally:
    await bot.session.close()
    await runner.cleanup()
```

if **name** == "**main**":
asyncio.run(main())
