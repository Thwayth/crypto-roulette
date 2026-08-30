```javascript
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


/* =========================
   PRIZES
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
   ELEMENTS
========================= */

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


/* =========================
   STATE
========================= */

let isSpinning = false;
let currentRotation = 0;


/* =========================
   SCREEN
========================= */

function showScreen(screen) {

    if (!screen) {
        return;
    }

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

    if (!tg?.HapticFeedback) {
        return;
    }

    try {

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


/* =========================
   RANDOM PRIZE
========================= */

function getRandomPrize() {

    const random =
        Math.random() * 100;

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

    if (!wheel) {
        return;
    }

    wheel
        .querySelectorAll(".wheel-label")
        .forEach(
            element => element.remove()
        );


    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
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


/* =========================
   BUTTONS
========================= */

function enableButtons() {

    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {

        if (button) {
            button.disabled = false;
        }

    });
}


function disableButtons() {

    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {

        if (button) {
            button.disabled = true;
        }

    });
}


/* =========================
   FREE SPIN
========================= */

function spinFree() {

    if (isSpinning) {
        return;
    }

    isSpinning = true;

    disableButtons();

    haptic();

    showScreen(
        rouletteScreen
    );

    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

        setTimeout(() => {

            progressBar.style.width =
                "100%";

        }, 50);
    }


    const prize =
        getRandomPrize();


    prepareWheel();


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            animateWheel(
                prize
            );

        });

    });


    setTimeout(() => {

        showResult(
            prize
        );

    }, 5700);
}


/* =========================
   PREPARE WHEEL
========================= */

function prepareWheel() {

    if (!wheel) {
        return;
    }

    wheel.style.transition =
        "none";

    wheel.style.transform =
        `rotate(${currentRotation}deg)`;

    void wheel.offsetWidth;
}


/* =========================
   ANIMATE WHEEL
========================= */

function animateWheel(prize) {

    if (!wheel) {
        return;
    }


    const index =
        prizes.findIndex(
            item =>
                item.id === prize.id
        );


    const sector =
        360 / prizes.length;


    const target =
        360 -
        (
            index * sector +
            sector / 2
        );


    const rotations =
        360 *
        (
            5 +
            Math.floor(
                Math.random() * 3
            )
        );


    currentRotation +=
        rotations +
        target;


    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12,0.72,0.18,1)";


    wheel.style.transform =
        `rotate(${currentRotation}deg)`;
}


/* =========================
   RESULT
========================= */

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

    enableButtons();

    haptic("success");

    showScreen(
        resultScreen
    );
}


/* =========================
   STARS
========================= */

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


    haptic();


    try {

        const userId =
            tg.initDataUnsafe?.user?.id || "";


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


        if (!response.ok || !data.url) {

            console.error(
                "Invoice error:",
                data
            );

            throw new Error(
                data.error ||
                "Не удалось создать оплату"
            );
        }


        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "Stars:",
                    status
                );


                if (status === "paid") {

                    haptic(
                        "success"
                    );


                    startPaidSpin();

                }


                if (status === "cancelled") {

                    console.log(
                        "Оплата отменена"
                    );
                }


                if (status === "failed") {

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );
                }

            }
        );


    } catch (error) {

        console.error(
            error
        );


        tg.showAlert?.(
            "❌ Не удалось открыть оплату.\n\n" +
            "Попробуйте ещё раз."
        );
    }
}


/* =========================
   PAID SPIN
========================= */

function startPaidSpin() {

    if (isSpinning) {
        return;
    }

    isSpinning = true;

    disableButtons();

    showScreen(
        rouletteScreen
    );


    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

        setTimeout(() => {

            progressBar.style.width =
                "100%";

        }, 50);
    }


    const prize =
        getRandomPrize();


    prepareWheel();


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            animateWheel(
                prize
            );

        });

    });


    setTimeout(() => {

        showResult(
            prize
        );

    }, 5700);
}


/* =========================
   CLAIM
========================= */

function claimPrize() {

    const url =
        "https://t.me/Andrey_AItrade";


    if (
        tg &&
        typeof tg.openTelegramLink ===
            "function"
    ) {

        tg.openTelegramLink(
            url
        );

        return;
    }


    window.open(
        url,
        "_blank"
    );
}


/* =========================
   EVENTS
========================= */

spinButton?.addEventListener(
    "click",
    spinFree
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

        showScreen(
            homeScreen
        );
    }
);


claimButton?.addEventListener(
    "click",
    claimPrize
);


/* =========================
   START
========================= */

createWheelLabels();

showScreen(
    homeScreen
);

console.log(
    "🎰 CRYPTO ROULETTE READY"
);
```
