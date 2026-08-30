const tg = window.Telegram?.WebApp;

if (tg) {
tg.ready();
tg.expand();

```
try {
    tg.setHeaderColor("#050608");
    tg.setBackgroundColor("#050608");
} catch (error) {
    console.log(error);
}
```

}

/* ==========================================
PRIZES
========================================== */

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

/* ==========================================
ELEMENTS
========================================== */

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

/* ==========================================
STATE
========================================== */

let isSpinning = false;
let currentRotation = 0;
let lastPrize = null;

/* ==========================================
FREE SPIN
========================================== */

const FREE_SPIN_KEY = "crypto_roulette_free_spin_used_v2";

function isFreeSpinUsed() {
return localStorage.getItem(FREE_SPIN_KEY) === "1";
}

function markFreeSpinUsed() {
localStorage.setItem(FREE_SPIN_KEY, "1");
}

/* ==========================================
SCREEN
========================================== */

function showScreen(screen) {

```
homeScreen.classList.remove("active");
rouletteScreen.classList.remove("active");
resultScreen.classList.remove("active");

screen.classList.add("active");

window.scrollTo(0, 0);
```

}

/* ==========================================
HAPTIC
========================================== */

function haptic(type = "light") {

```
if (!tg || !tg.HapticFeedback) {
    return;
}

try {

    if (type === "success") {
        tg.HapticFeedback.notificationOccurred("success");
    } else if (type === "error") {
        tg.HapticFeedback.notificationOccurred("error");
    } else {
        tg.HapticFeedback.impactOccurred("light");
    }

} catch (error) {
    console.log(error);
}
```

}

/* ==========================================
RANDOM PRIZE
========================================== */

function getRandomPrize() {

```
const random = Math.random() * 100;

let cumulative = 0;

for (const prize of prizes) {

    cumulative += prize.chance;

    if (random < cumulative) {
        return prize;
    }
}

return prizes[prizes.length - 1];
```

}

/* ==========================================
WHEEL LABELS
========================================== */

function createWheelLabels() {

```
wheel.querySelectorAll(".wheel-label")
    .forEach(label => label.remove());

const labels = [
    {
        className: "one",
        text: "🏆<br>$1,000"
    },
    {
        className: "two",
        text: "💎<br>VIP"
    },
    {
        className: "three",
        text: "🔥<br>МАРАФОН"
    },
    {
        className: "four",
        text: "📈<br>СИГНАЛ<br>300%"
    },
    {
        className: "five",
        text: "🎓<br>ОБУЧЕНИЕ"
    }
];

labels.forEach(item => {

    const element = document.createElement("div");

    element.className =
        `wheel-label ${item.className}`;

    element.innerHTML = item.text;

    wheel.appendChild(element);
});
```

}

/* ==========================================
BUTTONS
========================================== */

function updateButtons() {

```
if (!isFreeSpinUsed()) {

    spinButton.style.display = "block";
    repeatHomeButton.style.display = "none";

    spinButton.innerHTML =
        "<span>◎</span> КРУТИТЬ БЕСПЛАТНО";

} else {

    spinButton.style.display = "none";
    repeatHomeButton.style.display = "block";

    repeatHomeButton.innerHTML =
        "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
}

spinAgainButton.innerHTML =
    "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";

repeatResultButton.innerHTML =
    "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
```

}

/* ==========================================
BUTTON ENABLE
========================================== */

function disableButtons() {

```
spinButton.disabled = true;
repeatHomeButton.disabled = true;
spinAgainButton.disabled = true;
repeatResultButton.disabled = true;
```

}

function enableButtons() {

```
spinButton.disabled = false;
repeatHomeButton.disabled = false;
spinAgainButton.disabled = false;
repeatResultButton.disabled = false;
```

}

/* ==========================================
PROGRESS
========================================== */

function animateProgress(duration) {

```
progressBar.style.width = "0%";

const start = performance.now();

function update(time) {

    const elapsed = time - start;

    const progress =
        Math.min(elapsed / duration, 1);

    progressBar.style.width =
        `${progress * 100}%`;

    if (progress < 1) {
        requestAnimationFrame(update);
    }
}

requestAnimationFrame(update);
```

}

/* ==========================================
PREPARE WHEEL
========================================== */

function prepareWheel() {

```
wheel.style.transition = "none";

wheel.style.willChange = "transform";

wheel.style.transform =
    `translate3d(0,0,0) rotate(${currentRotation}deg)`;

void wheel.offsetWidth;
```

}

/* ==========================================
ANIMATE WHEEL
========================================== */

function animateWheel(prize) {

```
const prizeIndex =
    prizes.findIndex(
        item => item.id === prize.id
    );

const sectorSize =
    360 / prizes.length;

const sectorCenter =
    prizeIndex * sectorSize +
    sectorSize / 2;

const targetAngle =
    360 - sectorCenter;

const extraRotations =
    360 * (
        5 +
        Math.floor(Math.random() * 3)
    );

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
```

}

/* ==========================================
FREE SPIN
========================================== */

function spinRoulette() {

```
if (isSpinning) {
    return;
}

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

spinStatus.textContent =
    "РУЛЕТКА КРУТИТСЯ...";

animateProgress(5500);

const selectedPrize =
    getRandomPrize();

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
```

}

/* ==========================================
RESULT
========================================== */

function showResult(prize) {

```
isSpinning = false;

resultIcon.textContent = prize.icon;

resultName.textContent = prize.name;

resultDescription.textContent =
    prize.description;

enableButtons();

updateButtons();

setTimeout(() => {

    wheel.style.willChange = "auto";

}, 300);

haptic("success");

showScreen(resultScreen);
```

}

/* ==========================================
⭐ TELEGRAM STARS PAYMENT
========================================== */

async function requestPaidSpin() {

```
if (isSpinning) {
    return;
}

haptic("light");

if (!tg) {

    alert(
        "Открой Mini App внутри Telegram."
    );

    return;
}

try {

    /*
     * Просим бот создать invoice.
     */

    const response = await fetch(
        "/create-invoice",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                initData: tg.initData
            })
        }
    );


    if (!response.ok) {

        throw new Error(
            "Не удалось создать счёт"
        );
    }


    const data =
        await response.json();


    if (!data.ok || !data.invoice_url) {

        throw new Error(
            data.error ||
            "Invoice URL не получен"
        );
    }


    /*
     * Открываем настоящее окно
     * оплаты Telegram Stars.
     */

    tg.openInvoice(
        data.invoice_url,
        function(status) {

            console.log(
                "Invoice status:",
                status
            );


            if (status === "paid") {

                haptic("success");

                /*
                 * После успешной оплаты
                 * запускаем платную рулетку.
                 */

                spinPaidRoulette();

            }

            else if (status === "cancelled") {

                console.log(
                    "Оплата отменена"
                );

            }

            else if (status === "failed") {

                haptic("error");

                if (
                    typeof tg.showAlert ===
                    "function"
                ) {

                    tg.showAlert(
                        "❌ Оплата не прошла."
                    );
                }
            }
        }
    );

} catch (error) {

    console.error(
        "Payment error:",
        error
    );

    haptic("error");

    if (
        typeof tg.showAlert ===
        "function"
    ) {

        tg.showAlert(
            "❌ Не удалось открыть оплату.\n\n" +
            "Попробуй ещё раз."
        );

    } else {

        alert(
            "❌ Не удалось открыть оплату."
        );
    }
}
```

}

/* ==========================================
PAID ROULETTE
========================================== */

function spinPaidRoulette() {

```
if (isSpinning) {
    return;
}

isSpinning = true;

disableButtons();

showScreen(rouletteScreen);

spinStatus.textContent =
    "ОПЛАТА ПОЛУЧЕНА ⭐\nРУЛЕТКА КРУТИТСЯ...";

animateProgress(5500);

const selectedPrize =
    getRandomPrize();

lastPrize = selectedPrize;

prepareWheel();

requestAnimationFrame(() => {

    requestAnimationFrame(() => {

        animateWheel(
            selectedPrize
        );

    });
});

setTimeout(() => {

    showResult(
        selectedPrize
    );

}, 5700);
```

}

/* ==========================================
CLAIM
========================================== */

function claimPrize() {

```
haptic("light");

const telegramUrl =
    "https://t.me/Andrey_AItrade";

if (
    tg &&
    typeof tg.openTelegramLink ===
    "function"
) {

    tg.openTelegramLink(
        telegramUrl
    );

    return;
}

window.open(
    telegramUrl,
    "_blank"
);
```

}

/* ==========================================
EVENTS
========================================== */

spinButton.addEventListener(
"click",
spinRoulette
);

repeatHomeButton.addEventListener(
"click",
requestPaidSpin
);

spinAgainButton.addEventListener(
"click",
requestPaidSpin
);

repeatResultButton.addEventListener(
"click",
requestPaidSpin
);

backButton.addEventListener(
"click",
() => {

```
    if (isSpinning) {
        return;
    }

    showScreen(homeScreen);

    updateButtons();
}
```

);

claimButton.addEventListener(
"click",
claimPrize
);

/* ==========================================
INIT
========================================== */

createWheelLabels();

updateButtons();

showScreen(homeScreen);
