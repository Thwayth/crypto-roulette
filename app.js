```javascript
"use strict";

console.log("CRYPTO ROULETTE: app.js loaded");

const tg = window.Telegram?.WebApp || null;

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


const prizes = [
    {
        icon: "🏆",
        name: "$1,000",
        description: "Заглавный приз",
        chance: 0.02
    },
    {
        icon: "💎",
        name: "VIP",
        description: "VIP-доступ",
        chance: 4.98
    },
    {
        icon: "🔥",
        name: "МАРАФОН",
        description: "Торговый марафон",
        chance: 10
    },
    {
        icon: "📈",
        name: "СИГНАЛ НА 300%",
        description: "Торговый сигнал",
        chance: 25
    },
    {
        icon: "🎓",
        name: "ОБУЧЕНИЕ",
        description: "Полный доступ",
        chance: 60
    }
];


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


let spinning = false;
let rotation = 0;


function showScreen(screen) {

    homeScreen.classList.remove("active");
    rouletteScreen.classList.remove("active");
    resultScreen.classList.remove("active");

    screen.classList.add("active");
}


function haptic() {

    try {

        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred("medium");
        }

    } catch (e) {}

}


function getPrize() {

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


function spin() {

    console.log("SPIN BUTTON CLICKED");

    if (spinning) {
        return;
    }

    spinning = true;

    haptic();

    showScreen(rouletteScreen);

    spinStatus.textContent = "РУЛЕТКА КРУТИТСЯ...";

    progressBar.style.width = "0%";

    const prize = getPrize();

    const index = prizes.indexOf(prize);

    const sector = 360 / prizes.length;

    const target =
        360 -
        (index * sector + sector / 2);

    const extra =
        360 *
        (5 + Math.floor(Math.random() * 3));

    rotation += extra + target;

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12,0.72,0.18,1)";

    wheel.style.transform =
        "rotate(" + rotation + "deg)";


    const start = performance.now();


    function progress(now) {

        const percent =
            Math.min(
                (now - start) / 5500,
                1
            );

        progressBar.style.width =
            (percent * 100) + "%";

        if (percent < 1) {
            requestAnimationFrame(progress);
        }

    }


    requestAnimationFrame(progress);


    setTimeout(() => {

        spinning = false;

        resultIcon.textContent =
            prize.icon;

        resultName.textContent =
            prize.name;

        resultDescription.textContent =
            prize.description;

        showScreen(resultScreen);

        haptic();

    }, 5700);

}


function paidSpin() {

    console.log("PAID SPIN BUTTON CLICKED");

    if (spinning) {
        return;
    }

    if (tg?.showAlert) {

        tg.showAlert(
            "⭐ Следующая прокрутка стоит 100 Stars."
        );

    } else {

        alert(
            "⭐ Следующая прокрутка стоит 100 Stars."
        );

    }

}


spinButton.addEventListener(
    "click",
    spin
);


repeatHomeButton.addEventListener(
    "click",
    paidSpin
);


spinAgainButton.addEventListener(
    "click",
    paidSpin
);


repeatResultButton.addEventListener(
    "click",
    paidSpin
);


backButton.addEventListener(
    "click",
    function () {

        if (!spinning) {
            showScreen(homeScreen);
        }

    }
);


claimButton.addEventListener(
    "click",
    function () {

        const url =
            "https://t.me/Andrey_AItrade";

        if (tg?.openTelegramLink) {
            tg.openTelegramLink(url);
        } else {
            window.open(url, "_blank");
        }

    }
);


createWheel();


function createWheel() {

    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
    ];

    labels.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            "wheel-label " + item[0];

        element.innerHTML =
            item[1];

        wheel.appendChild(element);

    });

}


showScreen(homeScreen);

console.log("CRYPTO ROULETTE: READY");
```
