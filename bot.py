import asyncio
import os
import sqlite3
from pathlib import Path

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    Message,
    LabeledPrice,
    PreCheckoutQuery,
)


# ============================================================
# CONFIG
# ============================================================

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError(
        "BOT_TOKEN не найден в Environment Variables"
    )


BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "roulette.db"

PORT = int(
    os.getenv("PORT", "10000")
)


# ============================================================
# TELEGRAM
# ============================================================

bot = Bot(
    token=BOT_TOKEN
)

dp = Dispatcher()


# ============================================================
# DATABASE
# ============================================================

def get_db():
    return sqlite3.connect(
        DB_PATH,
        timeout=30
    )


def init_db():

    conn = get_db()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS free_spins (
            user_id INTEGER PRIMARY KEY,
            used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            payload TEXT NOT NULL,
            amount INTEGER NOT NULL,
            currency TEXT NOT NULL,
            telegram_charge_id TEXT,
            provider_charge_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()

    print("✅ DATABASE INITIALIZED")


# ============================================================
# FREE SPIN DATABASE
# ============================================================

def has_free_spin(user_id: int) -> bool:

    conn = get_db()

    try:

        result = conn.execute(
            """
            SELECT 1
            FROM free_spins
            WHERE user_id = ?
            LIMIT 1
            """,
            (user_id,)
        ).fetchone()

        return result is not None

    finally:

        conn.close()


def use_free_spin(user_id: int) -> bool:

    conn = get_db()

    try:

        cursor = conn.execute(
            """
            INSERT OR IGNORE INTO free_spins (user_id)
            VALUES (?)
            """,
            (user_id,)
        )

        conn.commit()

        return cursor.rowcount == 1

    finally:

        conn.close()


# ============================================================
# PAYMENT DATABASE
# ============================================================

def save_payment(
    user_id: int,
    payload: str,
    amount: int,
    currency: str,
    telegram_charge_id: str,
    provider_charge_id: str
):

    conn = get_db()

    try:

        conn.execute(
            """
            INSERT INTO payments (
                user_id,
                payload,
                amount,
                currency,
                telegram_charge_id,
                provider_charge_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                payload,
                amount,
                currency,
                telegram_charge_id,
                provider_charge_id
            )
        )

        conn.commit()

    finally:

        conn.close()


# ============================================================
# CHECK PAID USER
# ============================================================

def has_paid_spin(user_id: int) -> bool:

    conn = get_db()

    try:

        result = conn.execute(
            """
            SELECT 1
            FROM payments
            WHERE user_id = ?
            LIMIT 1
            """,
            (user_id,)
        ).fetchone()

        return result is not None

    finally:

        conn.close()


# ============================================================
# /START
# ============================================================

@dp.message(CommandStart())
async def start(message: Message):

    await message.answer(
        "🎰 CRYPTO ROULETTE\n\n"
        "Добро пожаловать!\n\n"
        "Открой Mini App и используй "
        "свой бесплатный прокрут."
    )


# ============================================================
# FREE SPIN API
# ============================================================

async def free_spin_api(
    request: web.Request
):

    try:

        data = await request.json()

    except Exception:

        return web.json_response(
            {
                "ok": False,
                "error": "Неверный формат запроса"
            },
            status=400
        )


    user_id = data.get("user_id")


    if not user_id:

        return web.json_response(
            {
                "ok": False,
                "error": "Telegram user_id не найден"
            },
            status=400
        )


    try:

        user_id = int(user_id)

    except (TypeError, ValueError):

        return web.json_response(
            {
                "ok": False,
                "error": "Некорректный user_id"
            },
            status=400
        )


    # --------------------------------------------------------
    # ПРОВЕРЯЕМ БЕСПЛАТНЫЙ ПРОКРУТ
    # --------------------------------------------------------

    if has_free_spin(user_id):

        print(
            "⚠️ FREE SPIN ALREADY USED:",
            user_id
        )

        return web.json_response(
            {
                "ok": False,
                "error": "Бесплатный прокрут уже использован"
            },
            status=409
        )


    # --------------------------------------------------------
    # ЗАНИМАЕМ БЕСПЛАТНЫЙ ПРОКРУТ
    # --------------------------------------------------------

    success = use_free_spin(user_id)


    if not success:

        return web.json_response(
            {
                "ok": False,
                "error": "Бесплатный прокрут уже использован"
            },
            status=409
        )


    print(
        "🎁 FREE SPIN USED:",
        user_id
    )


    return web.json_response(
        {
            "ok": True,
            "free_spin": True
        }
    )


# ============================================================
# CREATE STARS INVOICE
# ============================================================

async def create_invoice(
    request: web.Request
):

    try:

        data = await request.json()

    except Exception:

        return web.json_response(
            {
                "ok": False,
                "error": "Неверный формат запроса"
            },
            status=400
        )


    user_id = data.get("user_id")


    if not user_id:

        return web.json_response(
            {
                "ok": False,
                "error": "Telegram user_id не найден"
            },
            status=400
        )


    try:

        user_id = int(user_id)

    except (TypeError, ValueError):

        return web.json_response(
            {
                "ok": False,
                "error": "Некорректный user_id"
            },
            status=400
        )


    # --------------------------------------------------------
    # ПОЛЬЗОВАТЕЛЬ ДОЛЖЕН ИМЕТЬ БЕСПЛАТНЫЙ СПИН
    # --------------------------------------------------------

    if not has_free_spin(user_id):

        return web.json_response(
            {
                "ok": False,
                "error": "Сначала используй бесплатную прокрутку"
            },
            status=400
        )


    # --------------------------------------------------------
    # PAYLOAD
    # --------------------------------------------------------

    payload = (
        f"roulette_paid:{user_id}"
    )


    # --------------------------------------------------------
    # TELEGRAM STARS
    # --------------------------------------------------------

    try:

        invoice_url = await bot.create_invoice_link(

            title="🎰 CRYPTO ROULETTE",

            description=(
                "Дополнительная прокрутка "
                "рулетки"
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

    except Exception as e:

        print(
            "❌ CREATE INVOICE ERROR:",
            repr(e)
        )

        return web.json_response(
            {
                "ok": False,
                "error": (
                    "Не удалось создать "
                    "счёт Telegram Stars"
                )
            },
            status=500
        )


    print(
        "⭐ INVOICE CREATED:",
        user_id
    )


    return web.json_response(
        {
            "ok": True,
            "url": invoice_url
        }
    )


# ============================================================
# PRE CHECKOUT
# ============================================================

@dp.pre_checkout_query()
async def pre_checkout(
    query: PreCheckoutQuery
):

    try:

        print(
            "💳 PRE CHECKOUT:",
            query.from_user.id,
            query.total_amount,
            query.currency,
            query.invoice_payload
        )


        # ----------------------------------------------------
        # ВАЛЮТА
        # ----------------------------------------------------

        if query.currency != "XTR":

            await query.answer(
                ok=False,
                error_message=(
                    "Ошибка валюты платежа."
                )
            )

            return


        # ----------------------------------------------------
        # ЦЕНА
        # ----------------------------------------------------

        if query.total_amount != 100:

            await query.answer(
                ok=False,
                error_message=(
                    "Неверная стоимость."
                )
            )

            return


        # ----------------------------------------------------
        # PAYLOAD
        # ----------------------------------------------------

        if not query.invoice_payload.startswith(
            "roulette_paid:"
        ):

            await query.answer(
                ok=False,
                error_message=(
                    "Неверный платёж."
                )
            )

            return


        # ----------------------------------------------------
        # PAYMENT OK
        # ----------------------------------------------------

        await query.answer(
            ok=True
        )

        print(
            "✅ PAYMENT APPROVED:",
            query.from_user.id
        )


    except Exception as e:

        print(
            "❌ PRE CHECKOUT ERROR:",
            repr(e)
        )


# ============================================================
# SUCCESSFUL PAYMENT
# ============================================================

@dp.message()
async def successful_payment(
    message: Message
):

    if not message.successful_payment:

        return


    payment = message.successful_payment

    user_id = message.from_user.id


    print(
        "=========================================="
    )

    print(
        "💰 SUCCESSFUL TELEGRAM STARS PAYMENT"
    )

    print(
        "USER:",
        user_id
    )

    print(
        "AMOUNT:",
        payment.total_amount
    )

    print(
        "CURRENCY:",
        payment.currency
    )

    print(
        "PAYLOAD:",
        payment.invoice_payload
    )

    print(
        "TELEGRAM CHARGE:",
        payment.telegram_payment_charge_id
    )

    print(
        "PROVIDER CHARGE:",
        payment.provider_payment_charge_id
    )

    print(
        "=========================================="
    )


    # --------------------------------------------------------
    # СОХРАНЯЕМ ПЛАТЁЖ
    # --------------------------------------------------------

    save_payment(

        user_id=user_id,

        payload=payment.invoice_payload,

        amount=payment.total_amount,

        currency=payment.currency,

        telegram_charge_id=(
            payment.telegram_payment_charge_id
        ),

        provider_charge_id=(
            payment.provider_payment_charge_id
        )
    )


    # --------------------------------------------------------
    # ОТВЕТ
    # --------------------------------------------------------

    await message.answer(
        "✅ Оплата прошла успешно!\n\n"
        "⭐ 100 Stars получены.\n"
        "🎰 Дополнительная прокрутка доступна."
    )


# ============================================================
# HEALTH
# ============================================================

async def health(
    request: web.Request
):

    return web.json_response(
        {
            "ok": True,
            "service": "crypto-roulette"
        }
    )


# ============================================================
# INDEX
# ============================================================

async def index(
    request: web.Request
):

    return web.FileResponse(
        BASE_DIR / "index.html"
    )


# ============================================================
# APP.JS
# ============================================================

async def app_js(
    request: web.Request
):

    return web.FileResponse(
        BASE_DIR / "app.js"
    )


# ============================================================
# STYLE.CSS
# ============================================================

async def style_css(
    request: web.Request
):

    return web.FileResponse(
        BASE_DIR / "style.css"
    )


# ============================================================
# WEB SERVER
# ============================================================

async def start_web_server():

    app = web.Application()


    # --------------------------------------------------------
    # PAGES
    # --------------------------------------------------------

    app.router.add_get(
        "/",
        index
    )

    app.router.add_get(
        "/index.html",
        index
    )


    # --------------------------------------------------------
    # FILES
    # --------------------------------------------------------

    app.router.add_get(
        "/app.js",
        app_js
    )

    app.router.add_get(
        "/style.css",
        style_css
    )


    # --------------------------------------------------------
    # API
    # --------------------------------------------------------

    app.router.add_get(
        "/health",
        health
    )

    app.router.add_post(
        "/use-free-spin",
        free_spin_api
    )

    app.router.add_post(
        "/create-invoice",
        create_invoice
    )


    # --------------------------------------------------------
    # START SERVER
    # --------------------------------------------------------

    runner = web.AppRunner(
        app
    )

    await runner.setup()


    site = web.TCPSite(
        runner,
        "0.0.0.0",
        PORT
    )

    await site.start()


    print(
        "=========================================="
    )

    print(
        "🌐 WEB SERVER STARTED"
    )

    print(
        f"PORT: {PORT}"
    )

    print(
        "=========================================="
    )


# ============================================================
# MAIN
# ============================================================

async def main():

    init_db()


    print(
        "=========================================="
    )

    print(
        "🎰 CRYPTO ROULETTE"
    )

    print(
        "🤖 BOT STARTING..."
    )

    print(
        "=========================================="
    )


    await start_web_server()


    print(
        "🌐 WEB SERVER READY"
    )

    print(
        "📡 TELEGRAM POLLING STARTED"
    )


    await dp.start_polling(
        bot
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    try:

        asyncio.run(
            main()
        )

    except KeyboardInterrupt:

        print(
            "🛑 BOT STOPPED"
        )
```
