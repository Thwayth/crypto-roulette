const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (e) {}
}

const CLAIM_USERNAME = "Andrey_AItrade";

const prizes = [
    {
        id: "jackpot",
        icon: "🏆",
        name: "$1,000",
        description: "Главный приз",
        chance: 0
    },
    {
        id: "vip",
        icon: "💎",
        name: "VIP КАНАЛ",
        description: "Доступ в VIP канал",
        chance: 0
    },
    {
        id: "marathon",
        icon: "🔥",
        name: "МАРАФОН",
        description: "Торговый марафон",
        chance: 0
    },
    {
        id: "signal",
        icon: "📈",
        name: "СИГНАЛ НА 300%",
        description: "Торговый сигнал",
        chance: 100
    },
    {
        id: "training",
        icon: "🎓",
        name: "ЛИЧНОЕ ОБУЧЕНИЕ",
        description: "Личное обучение",
        chance: 0
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

const SPIN_TIME = 5500;
const DAY = 24 * 60 * 60 * 1000;
const LAST_SPIN_KEY = "crypto_roulette_last_spin";

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

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(function(item) {
        item.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}

function getLastSpin() {
    const value = localStorage.getItem(LAST_SPIN_KEY);

    if (!value) {
        return 0;
    }

    return Number(value);
}

function canSpin() {
    const lastSpin = getLastSpin();

    if (!lastSpin) {
        return true;
    }

    return Date.now() - lastSpin >= DAY;
}

function getRemainingTime() {
    const lastSpin = getLastSpin();

    if (!lastSpin) {
        return 0;
    }

    return Math.max(
        0,
        DAY - (Date.now() - lastSpin)
    );
}

function formatRemainingTime(milliseconds) {
    const totalSeconds = Math.ceil(
        milliseconds / 1000
    );

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
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

    return prizes.find(function(prize) {
        return prize.id === "signal";
    });
}

function createWheelLabels() {
    const labels = [
        ["one", "🏆", "$1,000"],
        ["two", "💎", "VIP КАНАЛ"],
        ["three", "🔥", "МАРАФОН"],
        ["four", "📈", "СИГНАЛ", "300%"],
        ["five", "🎓", "ЛИЧНОЕ", "ОБУЧЕНИЕ"]
    ];

    wheel.querySelectorAll(".wheel-label").forEach(function(label) {
        label.remove();
    });

    labels.forEach(function(item) {
        const label = document.createElement("div");

        label.className =
            "wheel-label " + item[0];

        let html =
            '<span class="label-icon">' +
            item[1] +
            "</span>";

        html += '<span class="label-text">';

        for (let i = 2; i < item.length; i++) {
            html += item[i];

            if (i < item.length - 1) {
                html += "<br>";
            }
        }

        html += "</span>";

        label.innerHTML = html;

        wheel.appendChild(label);
    });
}

function updateSpinButton() {
    if (!spinButton) {
        return;
    }

    if (canSpin()) {
        spinButton.disabled = false;

        spinButton.innerHTML =
            "<span>◎</span> КРУТИТЬ";
    } else {
        const remaining =
            getRemainingTime();

        spinButton.disabled = true;

        spinButton.innerHTML =
            "<span>⏳</span> СЛЕДУЮЩАЯ ПРОКРУТКА " +
            formatRemainingTime(remaining);
    }
}

function startProgress() {
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    void progressBar.offsetWidth;

    requestAnimationFrame(function() {
        progressBar.style.transition =
            "width 5.5s linear";

        progressBar.style.width = "100%";
    });
}

function animateWheel(prize) {
    const prizeIndex = prizes.findIndex(function(item) {
        return item.id === prize.id;
    });

    const sector = 360 / prizes.length;

    const sectorCenter =
        prizeIndex * sector +
        sector / 2;

    const targetAngle =
        360 - sectorCenter;

    const randomOffset =
        (Math.random() - 0.5) *
        sector *
        0.25;

    const currentNormalized =
        ((currentRotation % 360) + 360) % 360;

    const desiredNormalized =
        (targetAngle + randomOffset + 360) % 360;

    const delta =
        (desiredNormalized -
            currentNormalized +
            360) %
        360;

    const newRotation =
        currentRotation +
        360 * 7 +
        delta;

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

function startSpin() {
    if (isSpinning) {
        return;
    }

    if (!canSpin()) {
        updateSpinButton();

        const remaining =
            getRemainingTime();

        const message =
            "Следующая прокрутка будет доступна через " +
            formatRemainingTime(remaining);

        if (tg && tg.showAlert) {
            tg.showAlert(message);
        } else {
            alert(message);
        }

        return;
    }

    isSpinning = true;

    spinButton.disabled = true;

    localStorage.setItem(
        LAST_SPIN_KEY,
        String(Date.now())
    );

    haptic("light");

    showScreen(rouletteScreen);

    spinStatus.textContent =
        "РУЛЕТКА КРУТИТСЯ...";

    startProgress();

    const prize = getRandomPrize();

    animateWheel(prize);

    setTimeout(function() {
        showResult(prize);
    }, SPIN_TIME + 200);
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

function claimPrize() {
    const url =
        "https://t.me/" +
        CLAIM_USERNAME;

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.location.href = url;
    }
}

spinButton.addEventListener(
    "click",
    function(event) {
        event.preventDefault();
        startSpin();
    }
);

backButton.addEventListener(
    "click",
    function(event) {
        event.preventDefault();

        if (isSpinning) {
            return;
        }

        showScreen(homeScreen);
        updateSpinButton();
    }
);

claimButton.addEventListener(
    "click",
    function(event) {
        event.preventDefault();
        function claimPrize() {
    const username = "Andrey_AItrade";
    const message = "СИГНАЛ 300% ЗАБИРАЮ";

    const url =
        "https://t.me/" +
        username +
        "?text=" +
        encodeURIComponent(message);

    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.location.href = url;
    }
}

createWheelLabels();

updateSpinButton();

showScreen(homeScreen);

setInterval(function() {
    if (!isSpinning) {
        updateSpinButton();
    }
}, 1000);

console.log("CRYPTO ROULETTE READY");
