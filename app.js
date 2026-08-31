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
        chance: 0.02
    },
    {
        id: "vip",
        icon: "💎",
        name: "VIP",
        description: "VIP-доступ",
        chance: 4.98
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

const homeScreen = document.getElementById("homeScreen");
const rouletteScreen = document.getElementById("rouletteScreen");
const resultScreen = document.getElementById("resultScreen");

const spinButton = document.getElementById("spinButton");
const backButton = document.getElementById("backButton");

const wheel = document.getElementById("wheel");
const spinStatus = document.getElementById("spinStatus");
const progressBar = document.getElementById("progressBar");

const resultIcon = document.getElementById("resultIcon");
const resultName = document.getElementById("resultName");
const resultDescription = document.getElementById("resultDescription");

const claimButton = document.getElementById("claimButton");

let isSpinning = false;
let currentRotation = 0;

const LAST_SPIN_KEY = "crypto_roulette_last_spin";

const DAY = 24 * 60 * 60 * 1000;

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(function(item) {
        item.classList.remove("active");
    });

    screen.classList.add("active");

    window.scrollTo(0, 0);
}

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

function getLastSpinTime() {
    const value = localStorage.getItem(LAST_SPIN_KEY);

    if (!value) {
        return 0;
    }

    return Number(value);
}

function canSpin() {
    const lastSpin = getLastSpinTime();

    if (!lastSpin) {
        return true;
    }

    return Date.now() - lastSpin >= DAY;
}

function getRemainingTime() {
    const lastSpin = getLastSpinTime();

    if (!lastSpin) {
        return 0;
    }

    const remaining =
        DAY - (Date.now() - lastSpin);

    return Math.max(0, remaining);
}

function formatRemainingTime() {
    const remaining = getRemainingTime();

    const hours =
        Math.floor(remaining / 3600000);

    const minutes =
        Math.floor(
            (remaining % 3600000) / 60000
        );

    return hours + " ч. " + minutes + " мин.";
}

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

    return prizes[prizes.length - 1];
}

function createWheelLabels() {

    const labels = [
        ["one", "🏆<br>$1,000"],
        ["two", "💎<br>VIP"],
        ["three", "🔥<br>МАРАФОН"],
        ["four", "📈<br>СИГНАЛ<br>300%"],
        ["five", "🎓<br>ОБУЧЕНИЕ"]
    ];

    labels.forEach(function(item) {

        const label =
            document.createElement("div");

        label.className =
            "wheel-label " + item[0];

        label.innerHTML =
            item[1];

        wheel.appendChild(label);
    });
}

function startProgress() {

    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    void progressBar.offsetWidth;

    requestAnimationFrame(function() {

        progressBar.style.transition =
            "width 5.5s linear";

        progressBar.style.width =
            "100%";
    });
}

function animateWheel(prize) {

    const prizeIndex =
        prizes.findIndex(function(item) {
            return item.id === prize.id;
        });

    const sector =
        360 / prizes.length;

    const sectorCenter =
        prizeIndex * sector +
        sector / 2;

    const targetAngle =
        360 - sectorCenter;

    const randomOffset =
        (Math.random() - 0.5) *
        sector *
        0.35;

    const newRotation =
        currentRotation +
        360 * 7 +
        targetAngle +
        randomOffset;

    wheel.style.transition = "none";

    wheel.style.transform =
        "rotate(" +
        currentRotation +
        "deg)";

    void wheel.offsetWidth;

    requestAnimationFrame(function() {

        requestAnimationFrame(function() {

            wheel.style.transition =
                "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

            wheel.style.transform =
                "rotate(" +
                newRotation +
                "deg)";

            currentRotation =
                newRotation;
        });
    });
}

function showResult(prize) {

    isSpinning = false;

    resultIcon.textContent =
        prize.icon;

    resultName.textContent =
        prize.name;

    resultDescription.textContent =
        prize.description;

    haptic("success");

    showScreen(resultScreen);
}

function spinRoulette() {

    if (isSpinning) {
        return;
    }

    if (!canSpin()) {

        showAlert(
            "⏳ Ты уже крутил рулетку.\n\n" +
            "Следующая прокрутка через " +
            formatRemainingTime() + "."
        );

        return;
    }

    isSpinning = true;

    spinButton.disabled = true;

    localStorage.setItem(
        LAST_SPIN_KEY,
        Date.now().toString()
    );

    haptic("light");

    showScreen(rouletteScreen);

    spinStatus.textContent =
        "РУЛЕТКА КРУТИТСЯ...";

    startProgress();

    const prize =
        getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {

        showResult(prize);

    }, 5700);
}

function showAlert(text) {

    if (tg && tg.showAlert) {
        tg.showAlert(text);
    } else {
        alert(text);
    }
}

function claimPrize() {

    const url =
        "https://t.me/Andrey_AItrade";

    if (tg && tg.openTelegramLink) {

        tg.openTelegramLink(url);

    } else {

        window.open(
            url,
            "_blank"
        );
    }
}

spinButton.addEventListener(
    "click",
    spinRoulette
);

backButton.addEventListener(
    "click",
    function() {

        if (isSpinning) {
            return;
        }

        showScreen(homeScreen);
    }
);

claimButton.addEventListener(
    "click",
    claimPrize
);

createWheelLabels();

showScreen(homeScreen);
