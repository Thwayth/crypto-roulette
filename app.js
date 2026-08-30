const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (e) {
        console.log("Telegram UI:", e);
    }
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


/* ==========================================
   TELEGRAM USER
========================================== */

function getTelegramUserId() {

    if (!tg) {
        return null;
    }

    return tg.initDataUnsafe?.user?.id || null;
}


/* ==========================================
   SCREEN
========================================== */

function showScreen(screen) {

    document.querySelectorAll(".screen").forEach((s) => {
        s.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}


/* ==========================================
   HAPTIC
========================================== */

function haptic(type = "light") {

    try {

        if (!tg?.HapticFeedback) {
            return;
        }

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


/* ==========================================
   RANDOM PRIZE
========================================== */

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


/* ==========================================
   WHEEL LABELS
========================================== */

function createWheelLabels() {

    if (!wheel) {
        return;
    }

    wheel.querySelectorAll(".wheel-label").forEach((x) => {
        x.remove();
    });

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


/* ==========================================
   BUTTONS
========================================== */

function setButtonsDisabled(value) {

    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach((button) => {

        if (button) {
            button.disabled = value;
        }

    });
}


/* ==========================================
   FREE SPIN
========================================== */

async function useFreeSpin() {

    const userId = getTelegramUserId();

    if (!userId) {

        tg?.showAlert?.(
            "❌ Не удалось определить Telegram пользователя."
        );

        return false;
    }

    try {

        const response = await fetch("/use-free-spin", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: userId
            })
        });


        const data = await response.json();


        if (!response.ok || !data.ok) {

            tg?.showAlert?.(
                data.error ||
                "❌ Бесплатная прокрутка уже использована."
            );

            return false;
        }


        return true;

    } catch (error) {

        console.error(
            "FREE SPIN ERROR:",
            error
        );

        tg?.showAlert?.(
            "❌ Сервер временно недоступен."
        );

        return false;
    }
}


/* ==========================================
   START WHEEL
========================================== */

function startWheelSpin(prize) {

    if (!wheel) {
        return;
    }

    const index = prizes.findIndex(
        (item) => item.id === prize.id
    );

    const sector = 360 / prizes.length;

    const sectorCenter =
        index * sector + sector / 2;

    const target =
        360 - sectorCenter;

    const extraRotations =
        360 * (
            5 +
            Math.floor(Math.random() * 3)
        );

    const randomOffset =
        (Math.random() - 0.5) *
        (sector * 0.35);


    let finalRotation =
        currentRotation +
        extraRotations +
        target +
        randomOffset;


    wheel.style.transition = "none";

    wheel.style.transform =
        `rotate(${currentRotation}deg)`;

    void wheel.offsetWidth;


    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

    wheel.style.willChange =
        "transform";


    wheel.style.transform =
        `rotate(${finalRotation}deg)`;


    currentRotation =
        finalRotation;


    if (progressBar) {

        progressBar.style.width = "0%";

        setTimeout(() => {

            progressBar.style.width = "100%";

        }, 50);
    }


    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";

    }


    setTimeout(() => {

        showResult(prize);

    }, 5700);
}


/* ==========================================
   FREE SPIN
========================================== */

async function spinRoulette() {

    if (isSpinning) {
        return;
    }


    if (!getTelegramUserId()) {

        tg?.showAlert?.(
            "Открой Mini App внутри Telegram."
        );

        return;
    }


    /*
        Сначала сервер проверяет,
        что бесплатная попытка ещё есть.
    */

    const allowed =
        await useFreeSpin();


    if (!allowed) {
        return;
    }


    isSpinning = true;

    setButtonsDisabled(true);

    haptic("light");

    showScreen(rouletteScreen);


    const prize =
        getRandomPrize();


    startWheelSpin(prize);
}


/* ==========================================
   RESULT
========================================== */

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

    haptic("success");

    showScreen(resultScreen);


    setTimeout(() => {

        if (wheel) {
            wheel.style.willChange =
                "auto";
        }

    }, 500);
}


/* ==========================================
   STARS PAYMENT
========================================== */

async function payStars() {

    if (isSpinning) {
        return;
    }


    const userId =
        getTelegramUserId();


    if (!userId) {

        tg?.showAlert?.(
            "Открой Mini App внутри Telegram."
        );

        return;
    }


    if (!tg?.openInvoice) {

        tg?.showAlert?.(
            "❌ Telegram Payments недоступен."
        );

        return;
    }


    try {

        haptic("light");


        const response =
            await fetch(
                "/create-invoice",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_id: userId
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "INVOICE RESPONSE:",
            data
        );


        if (
            !response.ok ||
            !data.ok ||
            !data.url
        ) {

            throw new Error(
                data.error ||
                "Не удалось создать счёт"
            );
        }


        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "PAYMENT STATUS:",
                    status
                );


                if (status === "paid") {

                    haptic("success");

                    /*
                        После успешной оплаты
                        запускаем оплаченный spin.
                    */

                    isSpinning = true;

                    setButtonsDisabled(true);

                    showScreen(
                        rouletteScreen
                    );


                    const prize =
                        getRandomPrize();


                    startWheelSpin(
                        prize
                    );
                }


                else if (
                    status === "cancelled"
                ) {

                    console.log(
                        "Пользователь отменил оплату"
                    );

                }


                else if (
                    status === "failed"
                ) {

                    haptic("error");

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );
                }


                else if (
                    status === "pending"
                ) {

                    console.log(
                        "Платёж ожидает обработки"
                    );
                }

            }
        );

    } catch (error) {

        console.error(
            "PAYMENT ERROR:",
            error
        );


        tg?.showAlert?.(
            "❌ Ошибка оплаты.\n\n" +
            error.message
        );
    }
}


/* ==========================================
   CLAIM PRIZE
========================================== */

function claimPrize() {

    haptic("light");


    const url =
        "https://t.me/Andrey_AItrade";


    if (tg?.openTelegramLink) {

        tg.openTelegramLink(url);

    } else {

        window.open(
            url,
            "_blank"
        );
    }
}


/* ==========================================
   EVENTS
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

        if (isSpinning) {
            return;
        }

        showScreen(homeScreen);
    }
);


claimButton?.addEventListener(
    "click",
    claimPrize
);


/* ==========================================
   INITIALIZE
========================================== */

createWheelLabels();

showScreen(homeScreen);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
