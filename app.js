const tg = window.Telegram?.WebApp;

if (tg) {
tg.ready();
tg.expand();

```
try {
    tg.setHeaderColor("#050608");
    tg.setBackgroundColor("#050608");
} catch (e) {}
```

}

const prizes = [
{
id: "jackpot",
icon: "🏆",
name: "$1,000",
description: "Главный приз",
chance: 0.0001
},
{
id: "vip",
icon: "💎",
name: "VIP КАНАЛ",
description: "Доступ в VIP",
chance: 4.9999
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
name: "ЛИЧНОЕ ОБУЧЕНИЕ",
description: "Персональное обучение",
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

function haptic(type = "light") {
if (!tg || !tg.HapticFeedback) {
return;
}

```
try {
    if (type === "success") {
        tg.HapticFeedback.notificationOccurred("success");
    } else {
        tg.HapticFeedback.impactOccurred("light");
    }
} catch (e) {}
```

}

function showScreen(screen) {
document.querySelectorAll(".screen").forEach(function(item) {
item.classList.remove("active");
});

```
if (screen) {
    screen.classList.add("active");
}

window.scrollTo(0, 0);
```

}

const DAILY_SPIN_KEY = "crypto_roulette_daily_spin_v2";

function getLastSpinTime() {
const value = localStorage.getItem(DAILY_SPIN_KEY);

```
if (!value) {
    return 0;
}

return Number(value) || 0;
```

}

function hasDailySpin() {
const lastSpin = getLastSpinTime();

```
if (!lastSpin) {
    return true;
}

const oneDay = 24 * 60 * 60 * 1000;

return Date.now() - lastSpin >= oneDay;
```

}

function saveDailySpin() {
localStorage.setItem(
DAILY_SPIN_KEY,
String(Date.now())
);
}

function getRemainingTime() {
const lastSpin = getLastSpinTime();

```
if (!lastSpin) {
    return 0;
}

const nextSpin =
    lastSpin + 24 * 60 * 60 * 1000;

return Math.max(
    0,
    nextSpin - Date.now()
);
```

}

function formatRemainingTime(ms) {
const totalSeconds =
Math.ceil(ms / 1000);

```
const hours =
    Math.floor(totalSeconds / 3600);

const minutes =
    Math.floor((totalSeconds % 3600) / 60);

const seconds =
    totalSeconds % 60;

return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
);
```

}

function updateSpinButton() {
if (!spinButton) {
return;
}

```
if (hasDailySpin()) {
    spinButton.disabled = false;
    spinButton.innerHTML =
        "<span>◎</span> КРУТИТЬ БЕСПЛАТНО";

    return;
}

spinButton.disabled = true;

spinButton.innerHTML =
    "<span>◷</span> СЛЕДУЮЩАЯ ПРОКРУТКА " +
    formatRemainingTime(getRemainingTime());
```

}

function getRandomPrize() {
const random = Math.random() * 100;

```
let total = 0;

for (const prize of prizes) {
    total += prize.chance;

    if (random < total) {
        return prize;
    }
}

return prizes[prizes.length - 1];
```

}

function createWheelLabels() {
if (!wheel) {
return;
}

```
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

    label.className =
        "wheel-label " + item[0];

    label.innerHTML = item[1];

    wheel.appendChild(label);
});
```

}

function startProgress() {
if (!progressBar) {
return;
}

```
progressBar.style.transition = "none";
progressBar.style.width = "0%";

void progressBar.offsetWidth;

requestAnimationFrame(function() {
    progressBar.style.transition =
        "width 5.5s linear";

    progressBar.style.width = "100%";
});
```

}

function animateWheel(prize) {
if (!wheel) {
return;
}

```
const prizeIndex =
    prizes.findIndex(function(item) {
        return item.id === prize.id;
    });

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
```

}

function startSpin(prize) {
if (isSpinning) {
return;
}

```
isSpinning = true;

if (spinButton) {
    spinButton.disabled = true;
}

haptic("light");

showScreen(rouletteScreen);

if (spinStatus) {
    spinStatus.textContent =
        "РУЛЕТКА КРУТИТСЯ...";
}

startProgress();

animateWheel(prize);

setTimeout(function() {
    showResult(prize);
}, 5700);
```

}

function spinRoulette() {
if (isSpinning) {
return;
}

```
if (!hasDailySpin()) {
    updateSpinButton();

    const time =
        formatRemainingTime(
            getRemainingTime()
        );

    if (tg && tg.showAlert) {
        tg.showAlert(
            "Следующая прокрутка через " +
            time
        );
    } else {
        alert(
            "Следующая прокрутка через " +
            time
        );
    }

    return;
}

saveDailySpin();

updateSpinButton();

const prize =
    getRandomPrize();

startSpin(prize);
```

}

function showResult(prize) {
isSpinning = false;

```
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

haptic("success");

showScreen(resultScreen);
```

}

function claimPrize() {
const url =
"https://t.me/vitalikadminn";

```
if (tg && tg.openTelegramLink) {
    tg.openTelegramLink(url);
} else {
    window.open(url, "_blank");
}
```

}

if (spinButton) {
spinButton.addEventListener(
"click",
spinRoulette
);
}

if (backButton) {
backButton.addEventListener(
"click",
function() {

```
        if (isSpinning) {
            return;
        }

        showScreen(homeScreen);

        updateSpinButton();
    }
);
```

}

if (claimButton) {
claimButton.addEventListener(
"click",
claimPrize
);
}

createWheelLabels();

updateSpinButton();

showScreen(homeScreen);

setInterval(function() {
updateSpinButton();
}, 1000);

console.log(
"CRYPTO ROULETTE READY"
);
