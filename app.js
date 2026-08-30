const tg = window.Telegram?.WebApp;


/* ============================================================
   TELEGRAM
============================================================ */

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


/* ============================================================
   PRIZES
============================================================ */

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


/* ============================================================
   ELEMENTS
============================================================ */

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


/* ============================================================
   STATE
============================================================ */

let isSpinning = false;
let currentRotation = 0;


/* ============================================================
   FREE SPIN
============================================================ */

const FREE_SPIN_KEY = "crypto_roulette_free_spin";

function hasUsedFreeSpin() {
    return localStorage.getItem(FREE_SPIN_KEY) === "1";
}

function markLocalFreeSpinUsed() {
    localStorage.setItem(FREE_SPIN_KEY, "1");
}


/* ============================================================
   TELEGRAM USER
============================================================ */

function getTelegramUserId() {

    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user &&
        tg.initDataUnsafe.user.id
    ) {
        return tg.initDataUnsafe.user.id;
    }

    return null;
}


/* ============================================================
   HAPTIC
============================================================ */

function haptic(type = "light") {

    if (!tg || !tg.HapticFeedback) {
        return;
    }

    try {

        if (type === "success") {
            tg.HapticFeedback.notificationOccurred("success");
        } else {
            tg.HapticFeedback.impactOccurred("light");
        }

    } catch (e) {
        console.log(e);
    }
}


/* ============================================================
   SCREENS
============================================================ */

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach(function(item) {
        item.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}


/* ============================================================
   RANDOM PRIZE
============================================================ */

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


/* ============================================================
   WHEEL LABELS
============================================================ */

function createWheelLabels() {

    if (!wheel) {
        return;
    }

    wheel
        .querySelectorAll(".wheel-label")
        .forEach(function(item) {
            item.remove();
        });

    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
    ];

    labels.forEach(function(item) {

        const label = document.createElement("div");

        label.className =
            "wheel-label " + item[0];

        label.innerHTML = item[1];

        wheel.appendChild(label);
    });
}


/* ============================================================
   BUTTONS
============================================================ */

function setButtonsDisabled(value) {

    const buttons = [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ];

    buttons.forEach(function(button) {

        if (button) {
            button.disabled = value;
        }
    });
}


function updateButtons() {

    const freeAvailable = !hasUsedFreeSpin();

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
            "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }

    if (repeatResultButton) {

        repeatResultButton.innerHTML =
            "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }
}


/* ============================================================
   PROGRESS
============================================================ */

function startProgress() {

    if (!progressBar) {
        return;
    }

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    void progressBar.offsetWidth;

    progressBar.style.transition =
        "width 5.5s linear";

    progressBar.style.width = "100%";
}


/* ============================================================
   WHEEL ANIMATION
============================================================ */

function animateWheel(prize) {

    if (!wheel) {

        console.error(
            "ОШИБКА: элемент #wheel не найден"
        );

        return;
    }

    const prizeIndex = prizes.findIndex(
        function(item) {
            return item.id === prize.id;
        }
    );

    const sector =
        360 / prizes.length;

    const sectorCenter =
        prizeIndex * sector + sector / 2;

    const targetAngle =
        360 - sectorCenter;

    const randomOffset =
        (Math.random() - 0.5) *
        sector *
        0.35;

    const additionalRotation =
        360 * 7 +
        targetAngle +
        randomOffset;

    currentRotation =
        currentRotation +
        additionalRotation;


    /*
       ВАЖНО:
       Сначала отключаем transition,
       затем принудительно применяем старое состояние,
       после чего включаем transition.
    */

    wheel.style.transition = "none";

    wheel.style.transform =
        "rotate(" +
        (currentRotation - additionalRotation) +
        "deg)";

    void wheel.offsetWidth;

    requestAnimationFrame(function() {

        requestAnimationFrame(function() {

            wheel.style.transition =
                "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

            wheel.style.transform =
                "rotate(" +
                currentRotation +
                "deg)";
        });
    });
}


/* ============================================================
   FREE SPIN — SERVER
============================================================ */

async function useFreeSpinOnServer() {

    const userId = getTelegramUserId();

    if (!userId) {

        throw new Error(
            "Не удалось определить Telegram пользователя."
        );
    }

    const response = await fetch(
        "/use-free-spin",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: userId,
                init_data: tg?.initData || ""
            })
        }
    );

    let data;

    try {
        data = await response.json();
    } catch (e) {

        throw new Error(
            "Сервер вернул неправильный ответ."
        );
    }

    console.log(
        "FREE SPIN RESPONSE:",
        data
    );

    if (!response.ok || !data.ok) {

        throw new Error(
            data.error ||
            "Бесплатный прокрут уже использован."
        );
    }

    return true;
}


/* ============================================================
   START FREE SPIN
============================================================ */

async function spinRoulette() {

    if (isSpinning) {
        return;
    }

    if (hasUsedFreeSpin()) {

        updateButtons();

        return;
    }

    if (!tg) {

        alert(
            "Открой Mini App внутри Telegram."
        );

        return;
    }

    const userId = getTelegramUserId();

    if (!userId) {

        if (tg.showAlert) {
            tg.showAlert(
                "❌ Не удалось определить пользователя Telegram."
            );
        }

        return;
    }

    /*
       Сначала подтверждаем бесплатный спин
       на сервере.
    */

    try {

        await useFreeSpinOnServer();

    } catch (error) {

        console.error(
            "FREE SPIN SERVER ERROR:",
            error
        );

        if (tg.showAlert) {

            tg.showAlert(
                "❌ " + error.message
            );
        }

        return;
    }


    /*
       Только после успешного ответа сервера
       помечаем спин локально.
    */

    markLocalFreeSpinUsed();

    updateButtons();

    isSpinning = true;

    setButtonsDisabled(true);

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    startProgress();

    const prize =
        getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {

        showResult(prize);

    }, 5700);
}


/* ============================================================
   RESULT
============================================================ */

function showResult(prize) {

    isSpinning = false;

    if (resultIcon) {
        resultIcon.textContent =
            prize.icon;
    }

    if (resultName) {
        resultName.textContent =
            prize.name;
    }

    if (resultDescription) {
        resultDescription.textContent =
            prize.description;
    }

    setButtonsDisabled(false);

    updateButtons();

    haptic("success");

    showScreen(resultScreen);
}


/* ============================================================
   CREATE STARS INVOICE
============================================================ */

async function payStars() {

    if (isSpinning) {
        return;
    }

    if (!tg) {

        alert(
            "Открой Mini App внутри Telegram."
        );

        return;
    }

    const userId =
        getTelegramUserId();

    if (!userId) {

        tg.showAlert?.(
            "❌ Не удалось определить Telegram пользователя."
        );

        return;
    }

    haptic("light");

    try {

        console.log(
            "CREATING STARS INVOICE FOR:",
            userId
        );

        const response = await fetch(
            "/create-invoice",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: userId,
                    init_data: tg.initData || ""
                })
            }
        );

        let data;

        try {
            data = await response.json();
        } catch (e) {

            throw new Error(
                "Сервер вернул неправильный ответ."
            );
        }

        console.log(
            "PAYMENT RESPONSE:",
            data
        );

        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "Не удалось создать оплату."
            );
        }

        if (!data.url) {

            throw new Error(
                "Сервер не вернул ссылку на оплату."
            );
        }

        console.log(
            "OPENING INVOICE:",
            data.url
        );


        /*
           Открываем стандартное окно Telegram
           для оплаты Stars.
        */

        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "TELEGRAM PAYMENT STATUS:",
                    status
                );

                if (status === "paid") {

                    haptic("success");

                    spinPaidRoulette();

                    return;
                }

                if (status === "cancelled") {

                    tg.showAlert?.(
                        "Оплата отменена."
                    );

                    return;
                }

                if (status === "failed") {

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );

                    return;
                }

                if (status === "pending") {

                    console.log(
                        "PAYMENT PENDING"
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "PAYMENT ERROR:",
            error
        );

        tg.showAlert?.(
            "❌ Ошибка оплаты.\n\n" +
            error.message
        );
    }
}


/* ============================================================
   PAID SPIN
============================================================ */

function spinPaidRoulette() {

    if (isSpinning) {
        return;
    }

    isSpinning = true;

    setButtonsDisabled(true);

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    startProgress();

    const prize =
        getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {

        showResult(prize);

    }, 5700);
}


/* ============================================================
   CLAIM PRIZE
============================================================ */

function claimPrize() {

    const url =
        "https://t.me/Andrey_AItrade";

    if (
        tg &&
        tg.openTelegramLink
    ) {

        tg.openTelegramLink(url);

    } else {

        window.open(
            url,
            "_blank"
        );
    }
}


/* ============================================================
   EVENTS
============================================================ */

if (spinButton) {

    spinButton.addEventListener(
        "click",
        spinRoulette
    );
}


if (repeatHomeButton) {

    repeatHomeButton.addEventListener(
        "click",
        payStars
    );
}


if (spinAgainButton) {

    spinAgainButton.addEventListener(
        "click",
        payStars
    );
}


if (repeatResultButton) {

    repeatResultButton.addEventListener(
        "click",
        payStars
    );
}


if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            if (isSpinning) {
                return;
            }

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


/* ============================================================
   START
============================================================ */

createWheelLabels();

updateButtons();

showScreen(homeScreen);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
