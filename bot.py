import asyncio
import json
import os
import uuid

from aiohttp import web
from aiogram import Bot, Dispatcher, F
from aiogram.filters import CommandStart
from aiogram.types import Message, LabeledPrice, PreCheckoutQuery


BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN не найден в Environment Variables")


bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

USERS_FILE = "users.json"


# =========================================================
# DATABASE
# =========================================================

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}

    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(
            users,
            f,
            ensure_ascii=False,
            indent=2
        )


users = load_users()


def get_user(user_id):
    user_id = str(user_id)

    if user_id not in users:
        users[user_id] = {
            "free_spin_used": False,
            "paid_spins": 0
        }
        save_users(users)

    return users[user_id]


# =========================================================
# START
# =========================================================

@dp.message(CommandStart())
async def start(message: Message):

    user = get_user(message.from_user.id)

    if user["free_spin_used"]:
        text = (
            "🎰 CRYPTO ROULETTE\n\n"
            "Твоя бесплатная прокрутка уже использована.\n\n"
            "Следующая прокрутка — 100 ⭐."
        )
    else:
        text = (
            "🎰 CRYPTO ROULETTE\n\n"
            "У тебя есть 1 бесплатная прокрутка!\n\n"
            "После неё следующая прокрутка стоит 100 ⭐."
        )

    await message.answer(text)


# =========================================================
# FREE SPIN
# =========================================================

async def use_free_spin(request):

    try:
        data = await request.json()

        user_id = str(data.get("user_id", ""))

        if not user_id:
            return web.json_response(
                {
                    "ok": False,
                    "error": "Telegram user_id не найден"
                },
                status=400
            )

        user = get_user(user_id)

        if user["free_spin_used"]:

            return web.json_response({
                "ok": False,
                "error": "Бесплатная прокрутка уже использована"
            })

        user["free_spin_used"] = True

        save_users(users)

        print(
            f"FREE SPIN USED: {user_id}"
        )

        return web.json_response({
            "ok": True
        })

    except Exception as e:

        print(
            "FREE SPIN ERROR:",
            repr(e)
        )

        return web.json_response(
            {
                "ok": False,
                "error": str(e)
            },
            status=500
        )


# =========================================================
# CREATE STARS INVOICE
# =========================================================

async def create_invoice(request):

    try:

        data = await request.json()

        user_id = str(
            data.get("user_id", "")
        )

        if not user_id:

            return web.json_response(
                {
                    "ok": False,
                    "error": "user_id не найден"
                },
                status=400
            )

        user = get_user(user_id)

        # Создаём уникальный payload
        payload = (
            f"roulette_100_"
            f"{user_id}_"
            f"{uuid.uuid4().hex}"
        )

        prices = [
            LabeledPrice(
                label="🎰 Прокрутка рулетки",
                amount=100
            )
        ]

        print(
            "CREATING INVOICE FOR:",
            user_id
        )

        invoice_url = await bot.create_invoice_link(
            title="🎰 CRYPTO ROULETTE",
            description="Одна дополнительная прокрутка рулетки",
            payload=payload,
            currency="XTR",
            prices=prices
        )

        print(
            "INVOICE CREATED:",
            invoice_url
        )

        return web.json_response({
            "ok": True,
            "url": invoice_url
        })

    except Exception as e:

        print(
            "CREATE INVOICE ERROR:",
            repr(e)
        )

        return web.json_response(
            {
                "ok": False,
                "error": str(e)
            },
            status=500
        )


# =========================================================
# PRE CHECKOUT
# =========================================================

@dp.pre_checkout_query()
async def pre_checkout(
    query: PreCheckoutQuery
):

    try:

        print(
            "PRE-CHECKOUT:",
            query.from_user.id,
            query.currency,
            query.total_amount,
            query.invoice_payload
        )

        # Проверяем Stars
        if query.currency != "XTR":

            await query.answer(
                ok=False,
                error_message="Ошибка валюты платежа."
            )

            return

        # Проверяем сумму
        if query.total_amount != 100:

            await query.answer(
                ok=False,
                error_message="Неверная сумма платежа."
            )

            return

        await query.answer(
            ok=True
        )

        print(
            "PRE-CHECKOUT APPROVED"
        )

    except Exception as e:

        print(
            "PRE-CHECKOUT ERROR:",
            repr(e)
        )

        try:
            await query.answer(
                ok=False,
                error_message="Ошибка обработки платежа."
            )
        except Exception:
            pass


# =========================================================
# SUCCESSFUL PAYMENT
# =========================================================

@dp.message(F.successful_payment)
async def successful_payment(
    message: Message
):

    payment = message.successful_payment

    user_id = str(
        message.from_user.id
    )

    user = get_user(user_id)

    user["paid_spins"] += 1

    save_users(users)

    print(
        "================================="
    )

    print(
        "⭐ PAYMENT SUCCESS"
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
        "CHARGE:",
        payment.telegram_payment_charge_id
    )

    print(
        "PAID SPINS:",
        user["paid_spins"]
    )

    print(
        "================================="
    )

    await message.answer(
        "✅ Оплата 100 ⭐ прошла!\n\n"
        "🎰 Тебе добавлена 1 прокрутка."
    )


# =========================================================
# HEALTH
# =========================================================

async def health(request):

    return web.Response(
        text="OK"
    )


# =========================================================
# WEB SERVER
# =========================================================

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

    app.router.add_post(
        "/use-free-spin",
        use_free_spin
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
        f"🌐 Web server запущен: {port}"
    )


# =========================================================
# MAIN
# =========================================================

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
