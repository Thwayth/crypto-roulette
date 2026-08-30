import asyncio
import os
import json

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, PreCheckoutQuery, LabeledPrice

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# ==========================================
# START
# ==========================================

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "Открой Mini App и крути рулетку."
    )


# ==========================================
# CREATE TELEGRAM STARS INVOICE
# ==========================================

async def create_invoice(request):

    try:
        data = await request.json()

        init_data = data.get("initData")

        if not init_data:
            return web.json_response(
                {
                    "ok": False,
                    "error": "Telegram initData отсутствует"
                },
                status=400
            )

        invoice_link = await bot.create_invoice_link(
            title="🎰 Crypto Roulette",
            description="Одна дополнительная прокрутка рулетки",
            payload="roulette_spin_100",
            currency="XTR",
            prices=[
                LabeledPrice(
                    label="Прокрутка рулетки",
                    amount=100
                )
            ]
        )

        return web.json_response(
            {
                "ok": True,
                "invoice_url": invoice_link
            }
        )

    except Exception as error:

        print(
            "❌ Ошибка создания invoice:",
            repr(error)
        )

        return web.json_response(
            {
                "ok": False,
                "error": str(error)
            },
            status=500
        )


# ==========================================
# PRE-CHECKOUT
# ==========================================

@dp.pre_checkout_query()
async def pre_checkout_handler(
    pre_checkout_query: PreCheckoutQuery
):

    if pre_checkout_query.invoice_payload != "roulette_spin_100":

        await pre_checkout_query.answer(
            ok=False,
            error_message="Неизвестный платёж."
        )

        return

    await pre_checkout_query.answer(
        ok=True
    )


# ==========================================
# SUCCESSFUL PAYMENT
# ==========================================

@dp.message(F.successful_payment)
async def successful_payment_handler(
    message: Message
):

    payment = message.successful_payment

    print(
        "================================="
    )

    print(
        "⭐ ПОЛУЧЕН ПЛАТЁЖ"
    )

    print(
        "User:",
        message.from_user.id
    )

    print(
        "Stars:",
        payment.total_amount
    )

    print(
        "Charge ID:",
        payment.telegram_payment_charge_id
    )

    print(
        "================================="
    )

    await message.answer(
        "✅ Оплата получена!\n\n"
        "⭐ 100 Stars\n\n"
        "Спасибо! Прокрутка оплачена."
    )


# ==========================================
# HEALTH CHECK
# ==========================================

async def health(request):

    return web.Response(
        text="OK"
    )


# ==========================================
# WEB SERVER
# ==========================================

async def start_web_server():

    app = web.Application()

    app.router.add_get(
        "/",
        health
    )

    app.router.add_get(
        "/health",
        health
    )

    app.router.add_post(
        "/create-invoice",
        create_invoice
    )

    port = int(
        os.getenv(
            "PORT",
            "10000"
        )
    )

    runner = web.AppRunner(app)

    await runner.setup()

    site = web.TCPSite(
        runner,
        "0.0.0.0",
        port
    )

    await site.start()

    print(
        f"🌐 Web server запущен на порту {port}"
    )


# ==========================================
# MAIN
# ==========================================

async def main():

    print(
        "🤖 Бот запускается..."
    )

    await start_web_server()

    print(
        "🤖 Telegram polling запущен!"
    )

    await dp.start_polling(
        bot
    )


if __name__ == "__main__":

    asyncio.run(
        main()
    )
