```javascript
const tg = window.Telegram && window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;

if (tg) {
    tg.ready();
    tg.expand();
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
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred("medium");
        }
    } catch (e) {}
}

function randomPrize() {
    let r = Math.random() * 100;
    let total = 0;

    for (const prize of prizes) {
        total += prize.chance;

        if (r < total) {
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

    wheel.querySelectorAll(".wheel-label").forEach(x => x.remove());

    labels.forEach(([className, text]) => {
        const el = document.createElement("div");
        el.className = "wheel-label " + className;
        el.innerHTML = text;
        wheel.appendChild(el);
    });
}

function startSpin() {
    if (spinning) return;

    spinning = true;
    haptic();

    showScreen(rouletteScreen);

    spinStatus.textContent = "РУЛЕТКА КРУТИТСЯ...";

    progressBar.style.width = "0%";

    const prize = randomPrize();

    const index = prizes.findIndex(p => p.id === prize.id);

    const sector = 360 / prizes.length;

    const target = 360 - (index * sector + sector / 2);

    const extra = 360 * (5 + Math.floor(Math.random() * 3));

    rotation += extra + target;

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12,0.72,0.18,1)";

    wheel.style.transform =
        "rotate(" + rotation + "deg)";

    const started = performance.now();

    function progress(now) {
        const value = Math.min(
            (now - started) / 5500,
            1
        );

        progressBar.style.width =
            (value * 100) + "%";

        if (value < 1) {
            requestAnimationFrame(progress);
        }
    }

    requestAnimationFrame(progress);

    setTimeout(() => {
        showResult(prize);
    }, 5700);
}

function showResult(prize) {
    spinning = false;

    resultIcon.textContent = prize.icon;
    resultName.textContent = prize.name;
    resultDescription.textContent = prize.description;

    showScreen(resultScreen);

    haptic();
}

function paidSpin() {
    if (spinning) return;

    if (!tg || !tg.showAlert) {
        alert("Нужно открыть Mini App внутри Telegram.");
        return;
    }

    tg.showAlert(
        "⭐ Следующая прокрутка стоит 100 Stars.\n\nОплата Stars будет подключена следующим шагом."
    );
}

spinButton.onclick = startSpin;

repeatHomeButton.onclick = paidSpin;

spinAgainButton.onclick = paidSpin;

repeatResultButton.onclick = paidSpin;

backButton.onclick = function () {
    if (!spinning) {
        showScreen(homeScreen);
    }
};

claimButton.onclick = function () {
    if (tg && tg.openTelegramLink) {
        tg.openTelegramLink("https://t.me/Andrey_AItrade");
    } else {
        window.open("https://t.me/Andrey_AItrade", "_blank");
    }
};

createWheelLabels();
showScreen(homeScreen);

console.log("CRYPTO ROULETTE JS OK");
```
