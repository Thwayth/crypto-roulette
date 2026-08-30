import asyncio
import os
import sqlite3
from pathlib import Path

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, LabeledPrice, PreCheckoutQuery


BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "roulette.db"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# ==============================
# DATABASE
# ==============================

def init_db():
    conn = sqlite3.connect(DB_PATH)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS free_spins (
            user_id INTEGER PRIMARY KEY
        )
    """)

    conn.commit()
    conn.close()


def has_free_spin(user_id):
    conn = sqlite3.connect(DB_PATH)

    result = conn.execute(
        "SELECT user_id FROM free_spins WHERE user_id = ?",
        (user_id,)
    ).fetchone()

    conn.close()

    return result is not None


def use_free_spin(user_id):
    conn = sqlite3.connect(DB_PATH)

    conn.execute(
        "INSERT OR IGNORE INTO free_spins (user_id) VALUES (?)",
        (user_id,)
    )

    conn.commit()
    conn.close()


# ==============================
# BOT
# ==============================

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Открой Mini App и прокрути рулетку."
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
                {"error": "Telegram user_id не найден"},
                status=400
            )

        user_id = int(user_id)

        # Пользователь должен сначала использовать бесплатный спин
        if not has_free_spin(user_id):
            return web.json_response(
                {"error": "Сначала используй бесплатную прокрутку"},
                status=400
            )

        invoice_url = await bot.create_invoice_link(
            title="Прокрутка рулетки",
            description="Дополнительная прокрутка CRYPTO ROULETTE",
            payload=f"roulette:{user_id}",
            currency="XTR",
            prices=[
                LabeledPrice(
                    label="Прокрутка рулетки",
                    amount=100
                )
            ],
            provider_token=""
        )

        return web.json_response({
            "url": invoice_url
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
async def pre_checkout(query: PreCheckoutQuery):
    try:
        await query.answer(ok=True)

        print(
            "PRE CHECKOUT:",
            query.from_user.id,
            query.total_amount,
            query.currency
        )

    except Exception as e:
        print("PRE CHECKOUT ERROR:", repr(e))


# ==============================
# SUCCESSFUL PAYMENT
# ==============================

@dp.message()
async def successful_payment(message: Message):

    if not message.successful_payment:
        return

    payment = message.successful_payment

    print(
        "PAYMENT SUCCESS:",
        message.from_user.id,
        payment.total_amount,
        payment.currency
    )

    await message.answer(
        "✅ Оплата прошла успешно!"
    )


# ==============================
# WEB SERVER
# ==============================

async def health(request):
    return web.Response(text="OK")


async def index(request):
    return web.FileResponse(
        BASE_DIR / "index.html"
    )


async def app_js(request):
    return web.FileResponse(
        BASE_DIR / "app.js"
    )


async def style_css(request):
    return web.FileResponse(
        BASE_DIR / "style.css"
    )


async def start_web_server():

    app = web.Application()

    app.router.add_get("/", index)
    app.router.add_get("/index.html", index)

    app.router.add_get("/app.js", app_js)
    app.router.add_get("/style.css", style_css)

    app.router.add_get("/health", health)

    app.router.add_post(
        "/create-invoice",
        create_invoice
    )

    port = int(
        os.getenv("PORT", "10000")
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
        f"WEB SERVER STARTED ON PORT {port}"
    )


# ==============================
# MAIN
# ==============================

async def main():

    init_db()

    print("BOT STARTING...")

    await start_web_server()

    print("TELEGRAM POLLING STARTED")

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
