```javascript
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (e) {
        console.log(e);
    }
}


/* =========================
   ПРИЗЫ
========================= */

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


/* =========================
   FREE SPIN
========================= */

const FREE_SPIN_KEY = "crypto_roulette_free_spin_used_v1";

function isFreeSpinUsed() {
    return localStorage.getItem(FREE_SPIN_KEY) === "1";
}

function markFreeSpinUsed() {
    localStorage.setItem(FREE_SPIN_KEY, "1");
}


/* =========================
   ELEMENTS
========================= */

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


/* =========================
   STATE
========================= */

let isSpinning = false;
let currentRotation = 0;
let lastPrize = null;


/* =========================
   SCREEN
========================= */

function showScreen(screen) {
    if (!screen) return;

    homeScreen?.classList.remove("active");
    rouletteScreen?.classList.remove("active");
    resultScreen?.classList.remove("active");

    screen.classList.add("active");

    window.scrollTo(0, 0);
}


/* =========================
   HAPTIC
========================= */

function haptic(type = "light") {
    if (!tg?.HapticFeedback) return;

    try {
        if (type === "success") {
            tg.HapticFeedback.notificationOccurred("success");
        } else if (type === "error") {
            tg.HapticFeedback.notificationOccurred("error");
        } else {
            tg.HapticFeedback.impactOccurred("light");
        }
    } catch (e) {
        console.log(e);
    }
}


/* =========================
   RANDOM PRIZE
========================= */

function getRandomPrize() {
    const random = Math.random() * 100;

    let cumulative = 0;

    for (const prize of prizes) {
        cumulative += prize.chance;

        if (random < cumulative) {
            return prize;
        }
    }

    return prizes[prizes.length - 1];
}


/* =========================
   WHEEL LABELS
========================= */

function createWheelLabels() {
    if (!wheel) return;

    wheel.querySelectorAll(".wheel-label").forEach(
        element => element.remove()
    );

    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
    ];

    labels.forEach(([className, text]) => {
        const element = document.createElement("div");

        element.className = `wheel-label ${className}`;
        element.innerHTML = text;

        wheel.appendChild(element);
    });
}


/* =========================
   BUTTONS
========================= */

function updateButtons() {
    const freeAvailable = !isFreeSpinUsed();

    if (spinButton) {
        spinButton.style.display =
            freeAvailable ? "block" : "none";

        spinButton.innerHTML =
            "<span>◎</span> КРУТИТЬ БЕСПЛАТНО";
    }

    if (repeatHomeButton) {
        repeatHomeButton.style.display =
            freeAvailable ? "none" : "block";

        repeatHomeButton.innerHTML =
            "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }

    if (spinAgainButton) {
        spinAgainButton.innerHTML =
            "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }

    if (repeatResultButton) {
        repeatResultButton.innerHTML =
            "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }
}


function disableButtons() {
    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {
        if (button) button.disabled = true;
    });
}


function enableButtons() {
    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {
        if (button) button.disabled = false;
    });
}


/* =========================
   PROGRESS
========================= */

function animateProgress(duration) {
    if (!progressBar) return;

    progressBar.style.width = "0%";

    const start = performance.now();

    function update(time) {
        const progress =
            Math.min((time - start) / duration, 1);

        progressBar.style.width =
            `${progress * 100}%`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}


/* =========================
   WHEEL
========================= */

function prepareWheel() {
    if (!wheel) return;

    wheel.style.transition = "none";
    wheel.style.willChange = "transform";

    wheel.style.transform =
        `translate3d(0,0,0) rotate(${currentRotation}deg)`;

    void wheel.offsetWidth;
}


function animateWheel(prize) {
    if (!wheel) return;

    const prizeIndex =
        prizes.findIndex(item => item.id === prize.id);

    const sectorSize = 360 / prizes.length;

    const sectorCenter =
        prizeIndex * sectorSize + sectorSize / 2;

    const targetAngle = 360 - sectorCenter;

    const extraRotations =
        360 * (5 + Math.floor(Math.random() * 3));

    const randomOffset =
        (Math.random() - 0.5) *
        (sectorSize * 0.45);

    const finalRotation =
        currentRotation +
        extraRotations +
        targetAngle +
        randomOffset;

    currentRotation = finalRotation;

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12,0.72,0.18,1)";

    wheel.style.transform =
        `translate3d(0,0,0) rotate(${finalRotation}deg)`;
}


/* =========================
   FREE SPIN
========================= */

function spinRoulette() {
    if (isSpinning) return;

    if (isFreeSpinUsed()) {
        requestPaidSpin();
        return;
    }

    markFreeSpinUsed();
    updateButtons();

    isSpinning = true;

    disableButtons();

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    animateProgress(5500);

    const selectedPrize = getRandomPrize();

    lastPrize = selectedPrize;

    prepareWheel();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            animateWheel(selectedPrize);
        });
    });

    setTimeout(() => {
        showResult(selectedPrize);
    }, 5700);
}


/* =========================
   RESULT
========================= */

function showResult(prize) {
    isSpinning = false;

    if (resultIcon) {
        resultIcon.textContent = prize.icon;
    }

    if (resultName) {
        resultName.textContent = prize.name;
    }

    if (resultDescription) {
        resultDescription.textContent = prize.description;
    }

    enableButtons();
    updateButtons();

    haptic("success");

    showScreen(resultScreen);
}


/* =========================
   STARS PAYMENT
========================= */

/*
   ВАЖНО:

   bot.py должен иметь endpoint:

   /create-invoice

   который возвращает:

   {
       "url": "https://t.me/$..."
   }

   Здесь Mini App получает invoice
   и открывает настоящее окно Telegram.
*/

async function requestPaidSpin() {
    if (isSpinning) return;

    haptic("light");

    try {
        if (!tg) {
            alert("Откройте Mini App внутри Telegram.");
            return;
        }

        tg.showPopup?.({
            title: "⭐ Крутить за 100 Stars",
            message: "Следующая прокрутка стоит 100 ⭐.",
            buttons: [
                {
                    id: "pay",
                    type: "default",
                    text: "Оплатить 100 ⭐"
                },
                {
                    id: "cancel",
                    type: "cancel",
                    text: "Отмена"
                }
            ]
        }, async (buttonId) => {

            if (buttonId !== "pay") {
                return;
            }

            await openStarsInvoice();
        });

    } catch (error) {
        console.error("Payment error:", error);

        try {
            await openStarsInvoice();
        } catch (e) {
            console.error(e);

            tg.showAlert?.(
                "Не удалось открыть оплату. Попробуйте ещё раз."
            );
        }
    }
}


/* =========================
   OPEN INVOICE
========================= */

async function openStarsInvoice() {

    try {
        const response =
            await fetch("/create-invoice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id:
                        tg?.initDataUnsafe?.user?.id || null
                })
            });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.url) {
            throw new Error(
                "Invoice URL отсутствует"
            );
        }

        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "Telegram invoice status:",
                    status
                );

                if (status === "paid") {

                    haptic("success");

                    tg.showAlert?.(
                        "✅ Оплата получена!\n\n" +
                        "Сейчас запускаем рулетку."
                    );

                    setTimeout(() => {
                        startPaidSpin();
                    }, 500);

                } else if (status === "cancelled") {

                    console.log(
                        "Пользователь отменил оплату"
                    );

                } else if (status === "failed") {

                    haptic("error");

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );

                } else if (status === "pending") {

                    tg.showAlert?.(
                        "⏳ Платёж обрабатывается."
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "Invoice error:",
            error
        );

        if (tg?.showAlert) {
            tg.showAlert(
                "❌ Не удалось создать оплату.\n\n" +
                "Проверьте настройки бота."
            );
        } else {
            alert(
                "Не удалось создать оплату."
            );
        }
    }
}


/* =========================
   PAID SPIN
========================= */

function startPaidSpin() {

    if (isSpinning) return;

    isSpinning = true;

    disableButtons();

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    animateProgress(5500);

    const selectedPrize = getRandomPrize();

    lastPrize = selectedPrize;

    prepareWheel();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            animateWheel(selectedPrize);
        });
    });

    setTimeout(() => {
        showResult(selectedPrize);
    }, 5700);
}


/* =========================
   CLAIM
========================= */

function claimPrize() {

    haptic("light");

    const telegramUrl =
        "https://t.me/Andrey_AItrade";

    if (
        tg &&
        typeof tg.openTelegramLink === "function"
    ) {
        tg.openTelegramLink(telegramUrl);
        return;
    }

    window.open(
        telegramUrl,
        "_blank"
    );
}


/* =========================
   EVENTS
========================= */

if (spinButton) {
    spinButton.addEventListener(
        "click",
        spinRoulette
    );
}

if (repeatHomeButton) {
    repeatHomeButton.addEventListener(
        "click",
        requestPaidSpin
    );
}

if (spinAgainButton) {
    spinAgainButton.addEventListener(
        "click",
        requestPaidSpin
    );
}

if (repeatResultButton) {
    repeatResultButton.addEventListener(
        "click",
        requestPaidSpin
    );
}

if (backButton) {
    backButton.addEventListener(
        "click",
        () => {
            if (isSpinning) return;

            showScreen(homeScreen);
            updateButtons();
        }
    );
}

if (claimButton) {
    claimButton.addEventListener(
        "click",
        claimPrize
    );
}


/* =========================
   START
========================= */

createWheelLabels();
updateButtons();
showScreen(homeScreen);

console.log(
    "🎰 CRYPTO ROULETTE JS загружен"
);
```
