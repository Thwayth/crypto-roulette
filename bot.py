import asyncio
import os
import uuid

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    LabeledPrice,
    PreCheckoutQuery,
)

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# ==============================
# START
# ==============================

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "Открой Mini App и крути рулетку."
    )


# ==============================
# CREATE STARS INVOICE
# ==============================

async def create_invoice(request):
    try:
        data = await request.json()

        user_id = data.get("user_id")

        if not user_id:
            return web.json_response(
                {"error": "user_id не найден"},
                status=400
            )

        payload = f"roulette_100_{user_id}_{uuid.uuid4().hex}"

        prices = [
            LabeledPrice(
                label="Прокрутка CRYPTO ROULETTE",
                amount=100
            )
        ]

        invoice_link = await bot.create_invoice_link(
            title="🎰 CRYPTO ROULETTE",
            description="Одна дополнительная прокрутка рулетки",
            payload=payload,
            currency="XTR",
            prices=prices
        )

        return web.json_response({
            "url": invoice_link
        })

    except Exception as e:
        print("CREATE INVOICE ERROR:", repr(e))

        return web.json_response(
            {"error": str(e)},
            status=500
        )


# ==============================
# PRE-CHECKOUT
# ==============================

@dp.pre_checkout_query()
async def process_pre_checkout(
    query: PreCheckoutQuery
):
    try:
        await query.answer(
            ok=True
        )

        print(
            "PRE-CHECKOUT OK:",
            query.id
        )

    except Exception as e:
        print(
            "PRE-CHECKOUT ERROR:",
            repr(e)
        )


# ==============================
# SUCCESSFUL PAYMENT
# ==============================

@dp.message(F.successful_payment)
async def successful_payment(
    message: Message
):
    payment = message.successful_payment

    print(
        "⭐ PAYMENT RECEIVED:",
        payment.total_amount,
        payment.currency,
        payment.telegram_payment_charge_id
    )

    await message.answer(
        "✅ Оплата 100 ⭐ прошла успешно!\n\n"
        "Прокрутка рулетки доступна."
    )


# ==============================
# WEB SERVER
# ==============================

async def health(request):
    return web.Response(text="OK")


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
            10000
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


# ==============================
# MAIN
# ==============================

async def main():

    print(
        "🤖 Бот запускается..."
    )

    await start_web_server()

    print(
        "🤖 Telegram polling запущен!"
    )

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
