const tg = window.Telegram && window.Telegram.WebApp;

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
description: "Заглавный приз"
},
{
id: "vip",
icon: "💎",
name: "VIP",
description: "VIP-доступ"
},
{
id: "marathon",
icon: "🔥",
name: "МАРАФОН",
description: "Торговый марафон"
},
{
id: "signal",
icon: "📈",
name: "СИГНАЛ НА 300%",
description: "Торговый сигнал"
},
{
id: "training",
icon: "🎓",
name: "ОБУЧЕНИЕ",
description: "Полный доступ"
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

let isSpinning = false;
let currentRotation = 0;

function alertUser(text) {
if (tg && tg.showAlert) {
tg.showAlert(text);
} else {
alert(text);
}
}

function haptic(type) {
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

    label.className = "wheel-label " + item[0];
    label.innerHTML = item[1];

    wheel.appendChild(label);
});
```

}

function setButtonsDisabled(value) {
[
spinButton,
repeatHomeButton,
spinAgainButton,
repeatResultButton
].forEach(function(button) {
if (button) {
button.disabled = value;
}
});
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
    progressBar.style.transition = "width 5.5s linear";
    progressBar.style.width = "100%";
});
```

}

function animateWheel(prize) {
if (!wheel) {
alertUser("Ошибка: колесо не найдено.");
return;
}

```
const prizeIndex = prizes.findIndex(function(item) {
    return item.id === prize.id;
});

if (prizeIndex < 0) {
    alertUser("Ошибка результата.");
    return;
}

const sector = 360 / prizes.length;
const sectorCenter = prizeIndex * sector + sector / 2;
const targetAngle = 360 - sectorCenter;

const randomOffset =
    (Math.random() - 0.5) * sector * 0.35;

const newRotation =
    currentRotation +
    360 * 7 +
    targetAngle +
    randomOffset;

wheel.style.transition = "none";

wheel.style.transform =
    "rotate(" + currentRotation + "deg)";

void wheel.offsetWidth;

requestAnimationFrame(function() {
    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

    wheel.style.transform =
        "rotate(" + newRotation + "deg)";

    currentRotation = newRotation;
});
```

}

async function spinRoulette() {
if (isSpinning) {
return;
}

```
if (!tg) {
    alertUser(
        "Открой эту рулетку внутри Telegram."
    );
    return;
}

if (!tg.initData) {
    alertUser(
        "Telegram не передал данные пользователя.\n\nОткрой Mini App через Telegram."
    );
    return;
}

const user =
    tg.initDataUnsafe &&
    tg.initDataUnsafe.user
        ? tg.initDataUnsafe.user
        : null;

if (!user || !user.id) {
    alertUser(
        "Не удалось определить пользователя Telegram."
    );
    return;
}

isSpinning = true;

setButtonsDisabled(true);

haptic("light");

showScreen(rouletteScreen);

if (spinStatus) {
    spinStatus.textContent =
        "ПРОВЕРЯЕМ ПРОКРУТКУ...";
}

try {
    const response = await fetch(
        "/spin",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                init_data: tg.initData,
                user_id: user.id,
                username: user.username || "",
                first_name: user.first_name || ""
            })
        }
    );

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(
            "Сервер вернул неправильный ответ."
        );
    }

    console.log("SPIN RESPONSE:", data);

    if (!response.ok || !data.ok) {
        isSpinning = false;

        setButtonsDisabled(false);

        showScreen(homeScreen);

        if (data.seconds_left) {
            const hours =
                Math.floor(
                    data.seconds_left / 3600
                );

            const minutes =
                Math.floor(
                    (data.seconds_left % 3600) / 60
                );

            alertUser(
                "⏳ Следующая прокрутка через " +
                hours +
                " ч. " +
                minutes +
                " мин."
            );
        } else {
            alertUser(
                data.error ||
                "Прокрутка недоступна."
            );
        }

        return;
    }

    const prize = data.prize;

    if (!prize) {
        throw new Error(
            "Сервер не вернул приз."
        );
    }

    if (spinStatus) {
        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }

    startProgress();

    animateWheel(prize);

    setTimeout(function() {
        showResult(prize);
    }, 5700);

} catch (error) {
    console.error(
        "CRYPTO ROULETTE ERROR:",
        error
    );

    isSpinning = false;

    setButtonsDisabled(false);

    showScreen(homeScreen);

    alertUser(
        "❌ Ошибка.\n\n" +
        error.message
    );
}
```

}

function showResult(prize) {
isSpinning = false;

```
if (resultIcon) {
    resultIcon.textContent = prize.icon;
}

if (resultName) {
    resultName.textContent = prize.name;
}

if (resultDescription) {
    resultDescription.textContent =
        prize.description;
}

setButtonsDisabled(false);

haptic("success");

showScreen(resultScreen);
```

}

function updateButtons() {
if (spinButton) {
spinButton.style.display = "block";
spinButton.innerHTML =
"<span>◎</span> КРУТИТЬ";
}

```
if (repeatHomeButton) {
    repeatHomeButton.style.display = "none";
}

if (spinAgainButton) {
    spinAgainButton.innerHTML =
        "<span>⏳</span> СЛЕДУЮЩАЯ ПРОКРУТКА ЧЕРЕЗ 24 ЧАСА";
}

if (repeatResultButton) {
    repeatResultButton.innerHTML =
        "<span>⏳</span> СЛЕДУЮЩАЯ ПРОКРУТКА ЧЕРЕЗ 24 ЧАСА";
}
```

}

function claimPrize() {
const url =
"https://t.me/Andrey_AItrade";

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

if (repeatHomeButton) {
repeatHomeButton.addEventListener(
"click",
spinRoulette
);
}

if (spinAgainButton) {
spinAgainButton.addEventListener(
"click",
function() {
alertUser(
"⏳ Следующая прокрутка доступна через 24 часа."
);
}
);
}

if (repeatResultButton) {
repeatResultButton.addEventListener(
"click",
function() {
alertUser(
"⏳ Следующая прокрутка доступна через 24 часа."
);
}
);
}

if (backButton) {
backButton.addEventListener(
"click",
function() {
if (isSpinning) {
return;
}

```
        showScreen(homeScreen);
        updateButtons();
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
updateButtons();
showScreen(homeScreen);

console.log("CRYPTO ROULETTE READY");
