import asyncio
import os
import sqlite3
from pathlib import Path

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message, LabeledPrice, PreCheckoutQuery

# ============================================================

# CONFIG

# ============================================================

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
raise RuntimeError("BOT_TOKEN не найден в Environment Variables")

BASE_DIR = Path(**file**).resolve().parent
DB_PATH = BASE_DIR / "roulette.db"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# ============================================================

# DATABASE

# ============================================================

def get_db():
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
return conn

def init_db():
conn = get_db()

```
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
```

def has_free_spin_been_used(user_id: int) -> bool:
conn = get_db()

```
result = conn.execute(
    "SELECT 1 FROM free_spins WHERE user_id = ?",
    (user_id,),
).fetchone()

conn.close()

return result is not None
```

def mark_free_spin_used(user_id: int) -> bool:
conn = get_db()

```
cursor = conn.execute(
    """
    INSERT OR IGNORE INTO free_spins (user_id)
    VALUES (?)
    """,
    (user_id,),
)

conn.commit()

inserted = cursor.rowcount == 1

conn.close()

return inserted
```

# ============================================================

# BOT / START

# ============================================================

@dp.message(CommandStart())
async def start(message: Message):
await message.answer(
"🎰 CRYPTO ROULETTE\n\n"
"Открой Mini App и используй свой бесплатный прокрут."
)

# ============================================================

# FREE SPIN API

# ============================================================

async def use_free_spin(request: web.Request):
try:
data = await request.json()

```
    user_id = data.get("user_id")

    if user_id is None:
        return web.json_response(
            {
                "ok": False,
                "error": "Telegram user_id не найден",
            },
            status=400,
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return web.json_response(
            {
                "ok": False,
                "error": "Некорректный user_id",
            },
            status=400,
        )

    success = mark_free_spin_used(user_id)

    if not success:
        return web.json_response(
            {
                "ok": False,
                "error": "Бесплатный прокрут уже использован",
            },
            status=409,
        )

    print(f"FREE SPIN USED: {user_id}")

    return web.json_response(
        {
            "ok": True,
            "message": "Бесплатный прокрут активирован",
        }
    )

except Exception as e:
    print(f"FREE SPIN ERROR: {repr(e)}")

    return web.json_response(
        {
            "ok": False,
            "error": "Ошибка сервера",
        },
        status=500,
    )
```

# ============================================================

# CREATE STARS INVOICE

# ============================================================

async def create_invoice(request: web.Request):
try:
data = await request.json()

```
    user_id = data.get("user_id")

    if user_id is None:
        return web.json_response(
            {
                "ok": False,
                "error": "Telegram user_id не найден",
            },
            status=400,
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return web.json_response(
            {
                "ok": False,
                "error": "Некорректный user_id",
            },
            status=400,
        )

    # Дополнительный прокрут доступен только после бесплатного.
    if not has_free_spin_been_used(user_id):
        return web.json_response(
            {
                "ok": False,
                "error": "Сначала используй бесплатную прокрутку",
            },
            status=400,
        )

    payload = f"roulette:{user_id}"

    invoice_url = await bot.create_invoice_link(
        title="Прокрутка рулетки",
        description="Дополнительная прокрутка CRYPTO ROULETTE",
        payload=payload,
        currency="XTR",
        prices=[
            LabeledPrice(
                label="Прокрутка рулетки",
                amount=100,
            )
        ],
        provider_token="",
    )

    print(f"INVOICE CREATED: {user_id}")

    return web.json_response(
        {
            "ok": True,
            "url": invoice_url,
        }
    )

except Exception as e:
    print(f"CREATE INVOICE ERROR: {repr(e)}")

    return web.json_response(
        {
            "ok": False,
            "error": str(e),
        },
        status=500,
    )
```

# ============================================================

# PRE-CHECKOUT

# ============================================================

@dp.pre_checkout_query()
async def pre_checkout(query: PreCheckoutQuery):
try:
print(
"PRE CHECKOUT:",
query.from_user.id,
query.total_amount,
query.currency,
query.invoice_payload,
)

```
    if query.currency != "XTR":
        await query.answer(
            ok=False,
            error_message="Неверная валюта платежа.",
        )
        return

    if query.total_amount != 100:
        await query.answer(
            ok=False,
            error_message="Неверная стоимость прокрутки.",
        )
        return

    await query.answer(ok=True)

except Exception as e:
    print(f"PRE CHECKOUT ERROR: {repr(e)}")

    try:
        await query.answer(
            ok=False,
            error_message="Ошибка проверки платежа.",
        )
    except Exception:
        pass
```

# ============================================================

# SUCCESSFUL PAYMENT

# ============================================================

@dp.message()
async def successful_payment(message: Message):
if not message.successful_payment:
return

```
payment = message.successful_payment
user_id = message.from_user.id

print(
    "PAYMENT SUCCESS:",
    user_id,
    payment.total_amount,
    payment.currency,
    payment.invoice_payload,
)

conn = get_db()

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
        payment.invoice_payload,
        payment.total_amount,
        payment.currency,
        payment.telegram_payment_charge_id,
        payment.provider_payment_charge_id,
    ),
)

conn.commit()
conn.close()

await message.answer(
    "✅ Оплата прошла успешно!\n\n"
    "Возвращайся в Mini App — прокрутка доступна."
)
```

# ============================================================

# HEALTH CHECK

# ============================================================

async def health(request: web.Request):
return web.json_response(
{
"ok": True,
"service": "crypto-roulette",
}
)

# ============================================================

# STATIC FILES

# ============================================================

async def index(request: web.Request):
return web.FileResponse(BASE_DIR / "index.html")

async def app_js(request: web.Request):
return web.FileResponse(BASE_DIR / "app.js")

async def style_css(request: web.Request):
return web.FileResponse(BASE_DIR / "style.css")

# ============================================================

# WEB SERVER

# ============================================================

async def start_web_server():
app = web.Application()

```
app.router.add_get("/", index)
app.router.add_get("/index.html", index)
app.router.add_get("/app.js", app_js)
app.router.add_get("/style.css", style_css)

app.router.add_get("/health", health)

app.router.add_post("/use-free-spin", use_free_spin)
app.router.add_post("/create-invoice", create_invoice)

port = int(os.getenv("PORT", "10000"))

runner = web.AppRunner(app)

await runner.setup()

site = web.TCPSite(
    runner,
    "0.0.0.0",
    port,
)

await site.start()

print(f"WEB SERVER STARTED ON PORT {port}")
```

# ============================================================

# MAIN

# ============================================================

async def main():
init_db()

```
print("================================")
print("🎰 CRYPTO ROULETTE")
print("BOT STARTING...")
print("================================")

await start_web_server()

print("TELEGRAM POLLING STARTED")

await dp.start_polling(bot)
```

# ============================================================

# RUN

# ============================================================

if **name** == "**main**":
asyncio.run(main())
