import os
import asyncio

from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    LabeledPrice,
    PreCheckoutQuery,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)


BOT_TOKEN = os.getenv("BOT_TOKEN")

WEB_APP_URL = "https://crypto-roulette-henna.vercel.app/"

STAR_PRICE = 100


if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN is not configured")


bot = Bot(token=BOT_TOKEN)

dp = Dispatcher()


# Количество оплаченных прокруток для каждого пользователя
paid_spins = {}


@dp.message(CommandStart())
async def start(message: Message):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎰 ОТКРЫТЬ РУЛЕТКУ",
                    web_app=WebAppInfo(url=WEB_APP_URL)
                )
            ]
        ]
    )

    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "🎁 Первая прокрутка — бесплатно.\n"
        "⭐ Следующая прокрутка — 100 Stars.",
        reply_markup=keyboard
    )


@dp.message(F.text == "/roulette")
async def roulette(message: Message):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎰 ОТКРЫТЬ РУЛЕТКУ",
                    web_app=WebAppInfo(url=WEB_APP_URL)
                )
            ]
        ]
    )

    await message.answer(
        "🎰 CRYPTO ROULETTE",
        reply_markup=keyboard
    )


@dp.message(F.text == "/pay")
async def pay(message: Message):

    prices = [
        LabeledPrice(
            label="1 дополнительная прокрутка",
            amount=STAR_PRICE
        )
    ]

    await bot.send_invoice(
        chat_id=message.chat.id,
        title="Дополнительная прокрутка",
        description="1 прокрутка CRYPTO ROULETTE",
        payload=f"spin_{message.from_user.id}",
        currency="XTR",
        prices=prices
    )


@dp.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery):

    await query.answer(ok=True)


@dp.message(F.successful_payment)
async def successful_payment(message: Message):

    user_id = message.from_user.id

    paid_spins[user_id] = paid_spins.get(user_id, 0) + 1

    await message.answer(
        "⭐ Оплата получена!\n\n"
        "Тебе добавлена 1 дополнительная прокрутка.\n\n"
        "Открой рулетку и крути! 🎰"
    )


async def main():

    print("🤖 CRYPTO ROULETTE BOT STARTED")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
