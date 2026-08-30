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

const homeScreen =
    document.getElementById("homeScreen");

const rouletteScreen =
    document.getElementById("rouletteScreen");

const resultScreen =
    document.getElementById("resultScreen");

const spinButton =
    document.getElementById("spinButton");

const repeatHomeButton =
    document.getElementById("repeatHomeButton");

const spinAgainButton =
    document.getElementById("spinAgainButton");

const repeatResultButton =
    document.getElementById("repeatResultButton");

const backButton =
    document.getElementById("backButton");

const wheel =
    document.getElementById("wheel");

const spinStatus =
    document.getElementById("spinStatus");

const progressBar =
    document.getElementById("progressBar");

const resultIcon =
    document.getElementById("resultIcon");

const resultName =
    document.getElementById("resultName");

const resultDescription =
    document.getElementById("resultDescription");

const claimButton =
    document.getElementById("claimButton");


/* ==========================================
   STATE
========================================== */

let isSpinning = false;
let currentRotation = 0;


/* ==========================================
   SCREEN
========================================== */

function showScreen(screen) {
    document
        .querySelectorAll(".screen")
        .forEach(element => {
            element.classList.remove("active");
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
            tg.HapticFeedback.notificationOccurred(
                "success"
            );
        } else {
            tg.HapticFeedback.impactOccurred(
                "light"
            );
        }
    } catch (e) {
        console.log(e);
    }
}


/* ==========================================
   RANDOM PRIZE
========================================== */

function getRandomPrize() {
    const random =
        Math.random() * 100;

    let total = 0;

    for (const prize of prizes) {
        total += prize.chance;

        if (random < total) {
            return prize;
        }
    }

    return prizes[
        prizes.length - 1
    ];
}


/* ==========================================
   WHEEL LABELS
========================================== */

function createWheelLabels() {
    if (!wheel) {
        console.error("❌ #wheel не найден");
        return;
    }

    wheel
        .querySelectorAll(".wheel-label")
        .forEach(element => {
            element.remove();
        });

    const labels = [
        [
            "one",
            "🏆<br>$1,000"
        ],
        [
            "two",
            "💎<br>VIP"
        ],
        [
            "three",
            "🔥<br>МАРАФОН"
        ],
        [
            "four",
            "📈<br>СИГНАЛ<br>300%"
        ],
        [
            "five",
            "🎓<br>ОБУЧЕНИЕ"
        ]
    ];

    labels.forEach(
        ([className, text]) => {
            const element =
                document.createElement("div");

            element.className =
                `wheel-label ${className}`;

            element.innerHTML =
                text;

            wheel.appendChild(
                element
            );
        }
    );
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
    ].forEach(button => {
        if (button) {
            button.disabled = value;
        }
    });
}


/* ==========================================
   ANIMATION
========================================== */

function spinWheel(prize) {
    if (!wheel) {
        console.error("❌ Wheel не найден");
        return;
    }

    const index =
        prizes.findIndex(
            item => item.id === prize.id
        );

    const sector =
        360 / prizes.length;

    const sectorCenter =
        index * sector +
        sector / 2;

    const target =
        360 - sectorCenter;

    const randomOffset =
        (Math.random() - 0.5) *
        sector *
        0.5;

    const extraRotation =
        360 *
        (
            6 +
            Math.floor(
                Math.random() * 2
            )
        );

    const startRotation =
        currentRotation;

    const finalRotation =
        startRotation +
        extraRotation +
        target +
        randomOffset;

    wheel.style.transition =
        "none";

    wheel.style.transform =
        `rotate(${startRotation}deg)`;

    void wheel.offsetWidth;

    requestAnimationFrame(() => {

        wheel.style.transition =
            "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

        wheel.style.transform =
            `rotate(${finalRotation}deg)`;

    });

    currentRotation =
        finalRotation;
}


/* ==========================================
   FREE SPIN
========================================== */

function spinRoulette() {
    if (isSpinning) {
        return;
    }

    if (!wheel) {
        alert("Ошибка: элемент рулетки #wheel не найден.");
        return;
    }

    isSpinning = true;

    setButtonsDisabled(true);

    haptic();

    showScreen(
        rouletteScreen
    );

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    if (progressBar) {
        progressBar.style.transition =
            "none";

        progressBar.style.width =
            "0%";

        void progressBar.offsetWidth;

        progressBar.style.transition =
            "width 5.5s linear";

        progressBar.style.width =
            "100%";
    }

    const prize =
        getRandomPrize();

    spinWheel(prize);

    setTimeout(() => {

        showResult(prize);

    }, 5700);
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

    showScreen(
        resultScreen
    );
}


/* ==========================================
   STARS PAYMENT
========================================== */

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

    try {
        haptic();

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
                        user_id:
                            tg.initDataUnsafe
                                ?.user
                                ?.id || ""
                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.url
        ) {
            throw new Error(
                data.error ||
                "Не удалось создать оплату"
            );
        }

        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "⭐ Payment:",
                    status
                );

                if (
                    status === "paid"
                ) {
                    haptic("success");

                    spinRoulette();
                }

                if (
                    status === "cancelled"
                ) {
                    console.log(
                        "Оплата отменена"
                    );
                }

                if (
                    status === "failed"
                ) {
                    tg.showAlert?.(
                        "❌ Оплата не прошла."
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
            "❌ Ошибка оплаты:\n\n" +
            error.message
        );
    }
}


/* ==========================================
   CLAIM
========================================== */

function claimPrize() {

    const url =
        "https://t.me/Andrey_AItrade";

    if (
        tg?.openTelegramLink
    ) {
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
        () => {

            if (isSpinning) {
                return;
            }

            showScreen(
                homeScreen
            );
        }
    );
}

if (claimButton) {
    claimButton.addEventListener(
        "click",
        claimPrize
    );
}


/* ==========================================
   START
========================================== */

createWheelLabels();

showScreen(
    homeScreen
);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
