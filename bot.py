import asyncio
import os
from pathlib import Path

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    LabeledPrice,
    PreCheckoutQuery,
)


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


# =========================
# CREATE STARS INVOICE
# =========================

async def create_invoice(request):
    try:
        data = await request.json()

        user_id = data.get("user_id")

        if not user_id:
            return web.json_response(
                {"error
