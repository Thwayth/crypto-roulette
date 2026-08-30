```python
import asyncio
import os
import json
import time

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    PreCheckoutQuery,
    LabeledPrice,
)


# ==========================================
# SETTINGS
# ==========================================

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError(
        "BOT_TOKEN не найден в Environment Variables"
    )


PORT = int(os.getenv("PORT", "10000"))

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# ==========================================
# TELEGRAM BOT
# ==========================================

@dp.message(CommandStart())
async def start(message: Message):

    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "Открой рулетку через Mini App."
    )


# ==========================================
# PAYMENTS
# ==========================================

@dp.pre_checkout_query()
async def process_pre_checkout(
    query: PreCheckoutQuery
):

    print(
        "💳 PRE-CHECKOUT:",
        query.id,
        query.total_amount,
        query.currency,
        query.invoice_payload
    )

    if query.currency != "XTR":
        await query.answer(
            ok=False,
            error_message="Неверная валюта."
        )
        return

    if query.total_amount != 100:
        await query.answer(
            ok=False,
            error_message="Неверная сумма."
        )
        return

    await query.answer(ok=True)


@dp.message(
    F.successful_payment
)
async def successful_payment(
    message: Message
):

    payment = message.successful_payment

    print(
        "✅ ОПЛАТА STARS:",
        payment.total_amount,
        payment.currency,
        payment.telegram_payment_charge_id
    )

    await message.answer(
        "✅ Оплата 100 ⭐ получена!\n\n"
        "🎰 Можно крутить рулетку."
    )


# ==========================================
# MINI APP: INDEX
# ==========================================

async def index(request):

    return web.FileResponse(
        "index.html"
    )


# ==========================================
# MINI APP: JS
# ==========================================

async def app_js(request):

    return web.FileResponse(
        "app.js"
    )


# ==========================================
# MINI APP: CSS
# ==========================================

async def style_css(request):

    return web.FileResponse(
        "style.css"
    )


# ==========================================
# HEALTH
# ==========================================

async def health(request):

    return web.Response(
        text="OK"
    )


# ==========================================
# CREATE STARS INVOICE
# ==========================================

async def create_invoice(request):

    try:

        data = await request.json()

    except Exception:

        data = {}


    user_id = data.get(
        "user_id",
        "unknown"
    )


    payload = (
        f"roulette_spin:"
        f"{user_id}:"
        f"{int(time.time())}"
    )


    print(
        "💰 Создание invoice:",
        payload
    )


    try:

        invoice_url = await bot.create_invoice_link(

            title="CRYPTO ROULETTE",

            description=(
                "Одна дополнительная "
                "прокрутка рулетки"
            ),

            payload=payload,

            currency="XTR",

            prices=[
                LabeledPrice(
                    label="Прокрутка рулетки",
                    amount=100
                )
            ],

            provider_token=""
        )


        print(
            "✅ Invoice создан"
        )


        return web.json_response(
            {
                "ok": True,
                "url": invoice_url
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
# WEB SERVER
# ==========================================

async def start_web_server():

    app = web.Application()


    # Mini App

    app.router.add_get(
        "/",
        index
    )

    app.router.add_get(
        "/index.html",
        index
    )

    app.router.add_get(
        "/app.js",
        app_js
    )

    app.router.add_get(
        "/style.css",
        style_css
    )


    # API

    app.router.add_get(
        "/health",
        health
    )

    app.router.add_post(
        "/create-invoice",
        create_invoice
    )


    runner = web.AppRunner(app)

    await runner.setup()


    site = web.TCPSite(
        runner,
        "0.0.0.0",
        PORT
    )


    await site.start()


    print(
        f"🌐 Web server запущен "
        f"на порту {PORT}"
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


# ==========================================
# RUN
# ==========================================

if __name__ == "__main__":

    try:

        asyncio.run(
            main()
        )

    except KeyboardInterrupt:

        print(
            "🛑 Бот остановлен"
        )
```
