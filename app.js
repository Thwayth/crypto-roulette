const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (e) {}
}


/* ==============================
   PRIZES
============================== */

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


/* ==============================
   ELEMENTS
============================== */

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


/* ==============================
   STATE
============================== */

let isSpinning = false;
let currentRotation = 0;


/* ==============================
   SCREEN
============================== */

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(function(item) {
        item.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}


/* ==============================
   HAPTIC
============================== */

function haptic(type) {
    if (!tg || !tg.HapticFeedback) {
        return;
    }

    try {
        if (type === "success") {
            tg.HapticFeedback.notificationOccurred("success");
        } else {
            tg.HapticFeedback.impactOccurred("light");
        }
    } catch (e) {}
}


/* ==============================
   RANDOM PRIZE
============================== */

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


/* ==============================
   WHEEL LABELS
============================== */

function createWheelLabels() {
    if (!wheel) {
        return;
    }

    wheel.querySelectorAll(".wheel-label").forEach(function(item) {
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

        label.className = "wheel-label " + item[0];
        label.innerHTML = item[1];

        wheel.appendChild(label);
    });
}


/* ==============================
   BUTTONS
============================== */

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


/* ==============================
   FREE SPIN
============================== */

const FREE_SPIN_KEY = "crypto_roulette_free_spin";

function hasUsedFreeSpin() {
    return localStorage.getItem(FREE_SPIN_KEY) === "1";
}

function useFreeSpin() {
    localStorage.setItem(FREE_SPIN_KEY, "1");
}


/* ==============================
   BUTTON VISIBILITY
============================== */

function updateButtons() {
    const freeAvailable = !hasUsedFreeSpin();

    if (spinButton) {
        spinButton.style.display = freeAvailable ? "block" : "none";
        spinButton.innerHTML = "<span>◎</span> КРУТИТЬ БЕСПЛАТНО";
    }

    if (repeatHomeButton) {
        repeatHomeButton.style.display = freeAvailable ? "none" : "block";
        repeatHomeButton.innerHTML = "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }

    if (spinAgainButton) {
        spinAgainButton.innerHTML = "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }

    if (repeatResultButton) {
        repeatResultButton.innerHTML = "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
    }
}


/* ==============================
   PROGRESS
============================== */

function startProgress() {
    if (!progressBar) {
        return;
    }

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    void progressBar.offsetWidth;

    progressBar.style.transition = "width 5.5s linear";
    progressBar.style.width = "100%";
}


/* ==============================
   WHEEL ANIMATION
============================== */

function animateWheel(prize) {
    if (!wheel) {
        console.error("ОШИБКА: #wheel не найден");
        return;
    }

    const prizeIndex = prizes.findIndex(function(item) {
        return item.id === prize.id;
    });

    const sector = 360 / prizes.length;

    const sectorCenter = prizeIndex * sector + sector / 2;

    const targetAngle = 360 - sectorCenter;

    const extraRotations = 360 * 6;

    const randomOffset = (Math.random() - 0.5) * sector * 0.35;

    currentRotation =
        currentRotation +
        extraRotations +
        targetAngle +
        randomOffset;

    wheel.style.transition =
        "none";

    wheel.style.transform =
        "rotate(" + currentRotation + "deg)";

    void wheel.offsetWidth;

    requestAnimationFrame(function() {
        wheel.style.transition =
            "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

        wheel.style.transform =
            "rotate(" + currentRotation + "deg)";
    });
}


/* ==============================
   FREE SPIN
============================== */

function spinRoulette() {
    if (isSpinning) {
        return;
    }

    if (hasUsedFreeSpin()) {
        return;
    }

    useFreeSpin();

    updateButtons();

    isSpinning = true;

    setButtonsDisabled(true);

    haptic("light");

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent = "РУЛЕТКА КРУТИТСЯ...";
    }

    startProgress();

    const prize = getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {
        showResult(prize);
    }, 5700);
}


/* ==============================
   RESULT
============================== */

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

    setButtonsDisabled(false);

    updateButtons();

    haptic("success");

    showScreen(resultScreen);
}


/* ==============================
   STARS PAYMENT
============================== */

async function payStars() {
    if (isSpinning) {
        return;
    }

    if (!tg) {
        alert("Открой Mini App внутри Telegram.");
        return;
    }

    haptic("light");

    try {
        if (tg.showPopup) {
            tg.showPopup(
                {
                    title: "⭐ Оплата",
                    message: "Создаём оплату на 100 Stars...",
                    buttons: [
                        {
                            type: "default",
                            text: "OK"
                        }
                    ]
                },
                function() {}
            );
        }

        const response = await fetch("/create-invoice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: tg.initDataUnsafe &&
                    tg.initDataUnsafe.user
                    ? tg.initDataUnsafe.user.id
                    : null,
                init_data: tg.initData || ""
            })
        });

        const data = await response.json();

        console.log("PAYMENT RESPONSE:", data);

        if (!response.ok) {
            throw new Error(
                data.error || "Сервер вернул ошибку"
            );
        }

        if (!data.url) {
            throw new Error(
                "Сервер не вернул ссылку на оплату"
            );
        }

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

                } else if (status === "cancelled") {

                    if (tg.showAlert) {
                        tg.showAlert("Оплата отменена.");
                    }

                } else if (status === "failed") {

                    if (tg.showAlert) {
                        tg.showAlert(
                            "❌ Оплата не прошла."
                        );
                    }
                }
            }
        );

    } catch (error) {

        console.error(
            "PAYMENT ERROR:",
            error
        );

        if (tg.showAlert) {
            tg.showAlert(
                "❌ Ошибка оплаты.\n\n" +
                error.message
            );
        } else {
            alert(
                "Ошибка оплаты:\n\n" +
                error.message
            );
        }
    }
}


/* ==============================
   PAID SPIN
============================== */

function spinPaidRoulette() {
    if (isSpinning) {
        return;
    }

    isSpinning = true;

    setButtonsDisabled(true);

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    startProgress();

    const prize = getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {
        showResult(prize);
    }, 5700);
}


/* ==============================
   CLAIM
============================== */

function claimPrize() {
    const url = "https://t.me/Andrey_AItrade";

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, "_blank");
    }
}


/* ==============================
   EVENTS
============================== */

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


/* ==============================
   START
============================== */

createWheelLabels();

updateButtons();

showScreen(homeScreen);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
