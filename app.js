const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

const prizes = [
    { id: "jackpot", icon: "🏆", name: "$1,000", description: "Заглавный приз", chance: 0.020 },
    { id: "vip", icon: "💎", name: "VIP", description: "VIP-доступ", chance: 4.980 },
    { id: "marathon", icon: "🔥", name: "МАРАФОН", description: "Торговый марафон", chance: 10 },
    { id: "signal", icon: "📈", name: "СИГНАЛ НА 300%", description: "Торговый сигнал", chance: 25 },
    { id: "training", icon: "🎓", name: "ОБУЧЕНИЕ", description: "Полный доступ", chance: 60 }
];

let isSpinning = false;
let currentRotation = 0;

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

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.remove("active");
    });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}

function haptic(type = "light") {
    try {
        if (!tg?.HapticFeedback) return;

        if (type === "success") {
            tg.HapticFeedback.notificationOccurred("success");
        } else {
            tg.HapticFeedback.impactOccurred("light");
        }
    } catch (e) {
        console.log(e);
    }
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

    return prizes[prizes.length - 1];
}

function createWheelLabels() {
    if (!wheel) return;

    wheel.querySelectorAll(".wheel-label").forEach(x => x.remove());

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

function setButtonsDisabled(value) {
    [
        spinButton,
        repeatHomeButton,
        spinAgainButton,
        repeatResultButton
    ].forEach(button => {
        if (button) button.disabled = value;
    });
}

function spinRoulette() {
    if (isSpinning) return;

    isSpinning = true;
    setButtonsDisabled(true);

    haptic();

    showScreen(rouletteScreen);

    if (spinStatus) {
        spinStatus.textContent = "РУЛЕТКА КРУТИТСЯ...";
    }

    if (progressBar) {
        progressBar.style.width = "0%";

        setTimeout(() => {
            progressBar.style.width = "100%";
        }, 50);
    }

    const prize = getRandomPrize();

    const index = prizes.findIndex(x => x.id === prize.id);
    const sector = 360 / prizes.length;
    const target = 360 - (index * sector + sector / 2);

    currentRotation += 360 * 6 + target;

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12,0.72,0.18,1)";

    wheel.style.transform =
        `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        showResult(prize);
    }, 5700);
}

function showResult(prize) {
    isSpinning = false;

    if (resultIcon) resultIcon.textContent = prize.icon;
    if (resultName) resultName.textContent = prize.name;
    if (resultDescription) resultDescription.textContent = prize.description;

    setButtonsDisabled(false);

    haptic("success");

    showScreen(resultScreen);
}

async function payStars() {
    if (isSpinning) return;

    if (!tg) {
        alert("Открой Mini App внутри Telegram.");
        return;
    }

    try {
        haptic();

        const response = await fetch("/create-invoice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: tg.initDataUnsafe?.user?.id || ""
            })
        });

        const data = await response.json();

        if (!response.ok || !data.url) {
            throw new Error(data.error || "Не удалось создать оплату");
        }

        tg.openInvoice(data.url, function(status) {
            console.log("Telegram payment status:", status);

            if (status === "paid") {
                haptic("success");
                spinRoulette();
            }

            if (status === "failed") {
                tg.showAlert?.("❌ Оплата не прошла.");
            }
        });

    } catch (error) {
        console.error(error);

        tg.showAlert?.(
            "❌ Не удалось открыть оплату.\n\n" +
            "Проверь, что бот запущен и сервер обновился."
        );
    }
}

function claimPrize() {
    const url = "https://t.me/Andrey_AItrade";

    if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
    } else {
        window.open(url, "_blank");
    }
}

spinButton?.addEventListener("click", spinRoulette);

repeatHomeButton?.addEventListener("click", payStars);

spinAgainButton?.addEventListener("click", payStars);

repeatResultButton?.addEventListener("click", payStars);

backButton?.addEventListener("click", () => {
    if (isSpinning) return;
    showScreen(homeScreen);
});

claimButton?.addEventListener("click", claimPrize);

createWheelLabels();

showScreen(homeScreen);

console.log("🎰 CRYPTO ROULETTE READY");
