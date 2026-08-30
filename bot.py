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


# ==========================================
# SETTINGS
# ==========================================

BOT_TOKEN = os.getenv("BOT_TOKEN")

WEB_APP_URL = "https://crypto-roulette-henna.vercel.app/"

STAR_PRICE = 100


# ==========================================
# CHECK TOKEN
# ==========================================

if not BOT_TOKEN:
    raise RuntimeError(
        "BOT_TOKEN is not configured"
    )


# ==========================================
# BOT
# ==========================================

bot = Bot(
    token=BOT_TOKEN
)

dp = Dispatcher()


# ==========================================
# TEMPORARY USER BALANCE
# ==========================================
#
# ВАЖНО:
# Это простая бесплатная версия.
#
# После перезапуска Render данные
# могут сброситься.
#
# Позже можно добавить базу данных.
#

paid_spins = {}


# ==========================================
# START
# ==========================================

@dp.message(CommandStart())
async def start(
    message: Message
):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎰 ОТКРЫТЬ РУЛЕТКУ",
                    web_app=WebAppInfo(
                        url=WEB_APP_URL
                    )
                )
            ]
        ]
    )

    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Испытай удачу и получи ценный приз!\n\n"
        "🎁 Первая прокрутка — бесплатно.\n"
        "⭐ Следующая прокрутка — 100 Stars.",
        reply_markup=keyboard
    )


# ==========================================
# PAYMENT
# ==========================================

async def send_stars_invoice(
    message: Message
):

    prices = [
        LabeledPrice(
            label="🎰 1 дополнительная прокрутка",
            amount=STAR_PRICE
        )
    ]

    await bot.send_invoice(
        chat_id=message.chat.id,

        title="Дополнительная прокрутка",

        description=(
            "1 дополнительная прокрутка "
            "CRYPTO ROULETTE"
        ),

        payload=f"spin_{message.from_user.id}",

        currency="XTR",

        prices=prices,

        provider_token=""
    )


# ==========================================
# PRE-CHECKOUT
# ==========================================

@dp.pre_checkout_query()
async def process_pre_checkout(
    query: PreCheckoutQuery
):

    await query.answer(
        ok=True
    )


# ==========================================
# SUCCESSFUL PAYMENT
# ==========================================

@dp.message(
    F.successful_payment
)
async def successful_payment(
    message: Message
):

    user_id = message.from_user.id

    paid_spins[user_id] = (
        paid_spins.get(user_id, 0) + 1
    )

    await message.answer(
        "⭐ Оплата получена!\n\n"
        "Тебе добавлена 1 дополнительная "
        "прокрутка.\n\n"
        "Открой рулетку и крути! 🎰"
    )


# ==========================================
# PAYMENT COMMAND
# ==========================================

@dp.message(
    F.text == "/pay"
)
async def pay_command(
    message: Message
):

    await send_stars_invoice(
        message
    )


# ==========================================
# HELP
# ==========================================

@dp.message(
    F.text == "/roulette"
)
async def roulette_command(
    message: Message
):

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎰 ОТКРЫТЬ РУЛЕТКУ",
                    web_app=WebAppInfo(
                        url=WEB_APP_URL
                    )
                ]
            ]
        ]
    )

    await message.answer(
        "🎰 CRYPTO ROULETTE",
        reply_markup=keyboard
    )


# ==========================================
# MAIN
# ==========================================

async def main():

    print(
        "🤖 CRYPTO ROULETTE BOT STARTED"
    )

    await dp.start_polling(
        bot
    )


if __name__ == "__main__":

    asyncio.run(
        main()
    )
