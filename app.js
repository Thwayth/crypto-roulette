```javascript
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (e) {}
}

const prizes = [
    {
        id: "jackpot",
        icon: "🏆",
        name: "$1,000",
        description: "Заглавный приз",
        chance: 0.020
    },
    {
        id: "vip",
        icon: "💎",
        name: "VIP",
        description: "VIP-доступ",
        chance: 4.980
    },
    {
        id: "marathon",
        icon: "🔥",
        name: "МАРАФОН",
        description: "Торговый марафон",
        chance: 10
    },
    {
        id: "signal",
        icon: "📈",
        name: "СИГНАЛ НА 300%",
        description: "Торговый сигнал",
        chance: 25
    },
    {
        id: "training",
        icon: "🎓",
        name: "ОБУЧЕНИЕ",
        description: "Полный доступ",
        chance: 60
    }
];

let isSpinning = false;
let currentRotation = 0;

const homeScreen = document.getElementById("homeScreen");
const rouletteScreen = document.getElementById("rouletteScreen");
const resultScreen = document.getElementById("resultScreen");

const spinButton = document.getElementById("spinButton");
const repeatHomeButton = document.getElementById("repeatHomeButton");
const spinAgainButton = document.getElementById("spinAgainButton");
const repeatResultButton = document.getElementById("repeatResultButton");
const backButton = document.getElementById("backButton");

const wheel = document.getElementById("wheel");
const spinStatus = document.getElementById("spinStatus");
const progressBar = document.getElementById("progressBar");

const resultIcon = document.getElementById("resultIcon");
const resultName = document.getElementById("resultName");
const resultDescription = document.getElementById("resultDescription");
const claimButton = document.getElementById("claimButton");


function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
    });

    screen.classList.add("active");

    window.scrollTo(0, 0);
}


function haptic(type = "light") {
    try {
        if (!tg?.HapticFeedback) return;

        if (type === "success") {
            tg.HapticFeedback.notificationOccurred("success");
        } else {
            tg.HapticFeedback.impactOccurred("light");
        }
    } catch (e) {}
}


function getRandomPrize() {
    const random = Math.random() * 100;
    let total = 0;

    for (const prize of prizes) {
        total += prize.chance;

        if (random < total) {
            return prize;
        }
    }

    return prizes[prizes.length - 1];
}


function createWheelLabels() {
    if (!wheel) return;

    wheel.querySelectorAll(".wheel-label").forEach(el => el.remove());

    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
    ];

    labels.forEach(([className, text]) => {
        const el = document.createElement("div");

        el.className = `wheel-label ${className}`;
        el.innerHTML = text;

        wheel.appendChild(el);
    });
}


function setButtonsDisabled(disabled) {
    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {
        if (button) {
            button.disabled = disabled;
        }
    });
}


/* ==========================================
   ОСНОВНАЯ АНИМАЦИЯ
========================================== */

function animateWheel(prize) {

    const prizeIndex = prizes.findIndex(
        prizeItem => prizeItem.id === prize.id
    );

    const sectorSize = 360 / prizes.length;

    const sectorCenter =
        prizeIndex * sectorSize +
        sectorSize / 2;

    /*
       Поворот выбранного сектора
       к верхнему указателю.
    */

    const targetAngle = 360 - sectorCenter;

    /*
       Всегда минимум 6 полных оборотов.
    */

    const fullSpins =
        360 * (6 + Math.floor(Math.random() * 2));

    /*
       Небольшая случайность внутри сектора.
    */

    const randomOffset =
        (Math.random() - 0.5) *
        sectorSize *
        0.5;

    /*
       Нормализуем текущий угол,
       чтобы число не росло бесконечно.
    */

    currentRotation = currentRotation % 360;

    const finalRotation =
        currentRotation +
        fullSpins +
        targetAngle +
        randomOffset;

    currentRotation = finalRotation;

    /*
       Сбрасываем transition перед новым запуском.
    */

    wheel.style.transition = "none";

    wheel.style.transform =
        `rotate(${currentRotation % 360}deg)`;

    /*
       Принудительный reflow.
    */

    void wheel.offsetWidth;

    /*
       Включаем плавную анимацию.
    */

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

    /*
       Очень важно:
       здесь используем полный finalRotation,
       а не % 360.
    */

    wheel.style.transform =
        `rotate(${finalRotation}deg)`;

    /*
       Прогресс.
    */

    if (progressBar) {
        progressBar.style.transition = "none";
        progressBar.style.width = "0%";

        void progressBar.offsetWidth;

        progressBar.style.transition =
            "width 5.5s linear";

        progressBar.style.width = "100%";
    }
}


/* ==========================================
   БЕСПЛАТНАЯ ПРОКРУТКА
========================================== */

function spinRoulette() {

    if (isSpinning) return;

    isSpinning = true;

    setButtonsDisabled(true);

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    const prize = getRandomPrize();

    /*
       Запускаем настоящую анимацию.
    */

    animateWheel(prize);

    /*
       Ждём окончания вращения.
    */

    setTimeout(() => {

        showResult(prize);

    }, 5700);
}


/* ==========================================
   РЕЗУЛЬТАТ
========================================== */

function showResult(prize) {

    isSpinning = false;

    if (resultIcon) {
        resultIcon.textContent = prize.icon;
    }

    if (resultName) {
        resultName.textContent = prize.name;
    }

    if (resultDescription) {
        resultDescription.textContent =
            prize.description;
    }

    if (spinStatus) {
        spinStatus.textContent = "ГОТОВО!";
    }

    setButtonsDisabled(false);

    haptic("success");

    showScreen(resultScreen);
}


/* ==========================================
   ОПЛАТА 100 STARS
========================================== */

async function payStars() {

    if (isSpinning) return;

    if (!tg) {
        alert("Открой Mini App внутри Telegram.");
        return;
    }

    try {

        haptic("light");

        const response = await fetch(
            "/create-invoice",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    user_id:
                        tg.initDataUnsafe?.user?.id || ""
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok || !data.url) {
            throw new Error(
                data.error ||
                "Не удалось создать оплату"
            );
        }

        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "Payment status:",
                    status
                );

                if (status === "paid") {

                    haptic("success");

                    /*
                       После успешной оплаты
                       запускаем рулетку.
                    */

                    spinRoulette();
                }

                if (status === "failed") {

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );
                }

                if (status === "cancelled") {

                    console.log(
                        "Пользователь отменил оплату"
                    );
                }
            }
        );

    } catch (error) {

        console.error(error);

        tg.showAlert?.(
            "❌ Не удалось открыть оплату."
        );
    }
}


/* ==========================================
   ЗАБРАТЬ ПРИЗ
========================================== */

function claimPrize() {

    const url =
        "https://t.me/Andrey_AItrade";

    if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, "_blank");
    }
}


/* ==========================================
   КНОПКИ
========================================== */

spinButton?.addEventListener(
    "click",
    spinRoulette
);

repeatHomeButton?.addEventListener(
    "click",
    payStars
);

spinAgainButton?.addEventListener(
    "click",
    payStars
);

repeatResultButton?.addEventListener(
    "click",
    payStars
);

backButton?.addEventListener(
    "click",
    () => {

        if (isSpinning) return;

        showScreen(homeScreen);
    }
);

claimButton?.addEventListener(
    "click",
    claimPrize
);


/* ==========================================
   START
========================================== */

createWheelLabels();

showScreen(homeScreen);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
```
