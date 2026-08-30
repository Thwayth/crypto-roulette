import asyncio
import os

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart, PreCheckoutQuery
from aiogram.types import (
    Message,
    LabeledPrice,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)

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
        "Открой Mini App и крути рулетку."
    )


# =========================
# ОПЛАТА 100 STARS
# =========================

async def create_invoice(request):
    try:
        data = await request.json()
        user_id = data.get("user_id")

        if not user_id:
            return web.json_response(
                {"error": "user_id не указан"},
                status=400
            )

        prices = [
            LabeledPrice(
                label="🎰 Одна прокрутка",
                amount=100
            )
        ]

        invoice = await bot.create_invoice_link(
            title="🎰 Crypto Roulette",
            description="Одна прокрутка рулетки",
            payload="roulette_spin_100",
            currency="XTR",
            prices=prices
        )

        return web.json_response({
            "ok": True,
            "invoice": invoice
        })

    except Exception as e:
        print(f"❌ Ошибка создания invoice: {e}")

        return web.json_response(
            {
                "ok": False,
                "error": str(e)
            },
            status=500
        )


# =========================
# PRE-CHECKOUT
# =========================

@dp.pre_checkout_query()
async def pre_checkout(pre_checkout_query: PreCheckoutQuery):
    if (
        pre_checkout_query.currency == "XTR"
        and pre_checkout_query.total_amount == 100
        and pre_checkout_query.invoice_payload == "roulette_spin_100"
    ):
        await pre_checkout_query.answer(ok=True)
    else:
        await pre_checkout_query.answer(
            ok=False,
            error_message="Ошибка оплаты."
        )


# =========================
# УСПЕШНАЯ ОПЛАТА
# =========================

@dp.message(F.successful_payment)
async def successful_payment(message: Message):
    payment = message.successful_payment

    print(
        f"💰 Успешная оплата: "
        f"{payment.total_amount} Stars | "
        f"user_id={message.from_user.id}"
    )

    await message.answer(
        "✅ Оплата получена!\n\n"
        "🎰 Прокрутка активирована!"
    )

    # Здесь позже можно запускать рулетку автоматически.


# =========================
# WEB SERVER
# =========================

async def health(request):
    return web.Response(text="OK")


async def start_web_server():
    app = web.Application()

    app.router.add_get("/", health)
    app.router.add_get("/health", health)

    # Создание invoice
    app.router.add_post("/invoice", create_invoice)

    port = int(os.getenv("PORT", 10000))

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
