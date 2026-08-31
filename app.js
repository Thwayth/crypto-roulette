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

function showAlert(text) {
    if (tg && tg.showAlert) {
        tg.showAlert(text);
    } else {
        alert(text);
    }
}

function haptic(type = "light") {
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

    screen.classList.add("active");

    window.scrollTo(0, 0);
}

function createWheelLabels() {
    if (!wheel) {
        return;
    }

    const oldLabels =
        wheel.querySelectorAll(".wheel-label");

    oldLabels.forEach(function(label) {
        label.remove();
    });

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

    if (!progressBar) {
        return;
    }

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

    const index =
        prizes.findIndex(function(item) {
            return item.id === prize.id;
        });

    if (index === -1) {
        return;
    }

    const sector =
        360 / prizes.length;

    const center =
        index * sector + sector / 2;

    const target =
        360 - center;

    const offset =
        (Math.random() - 0.5) *
        sector *
        0.35;

    const rotation =
        currentRotation +
        360 * 7 +
        target +
        offset;

    wheel.style.transition = "none";

    wheel.style.transform =
        "rotate(" +
        currentRotation +
        "deg)";

    void wheel.offsetWidth;

    requestAnimationFrame(function() {

        wheel.style.transition =
            "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";

        wheel.style.transform =
            "rotate(" +
            rotation +
            "deg)";

        currentRotation =
            rotation;
    });
}

async function spinRoulette() {

    if (isSpinning) {
        return;
    }

    if (!tg) {
        showAlert(
            "Открой рулетку внутри Telegram."
        );
        return;
    }

    const user =
        tg.initDataUnsafe?.user;

    if (!user || !user.id) {
        showAlert(
            "Не удалось определить пользователя Telegram."
        );
        return;
    }

    isSpinning = true;

    spinButton.disabled = true;

    haptic("light");

    showScreen(rouletteScreen);

    spinStatus.textContent =
        "ПРОВЕРЯЕМ ПРОКРУТКУ...";

    try {

        const response =
            await fetch("/spin", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    init_data:
                        tg.initData || "",

                    user_id:
                        user.id,

                    username:
                        user.username || "",

                    first_name:
                        user.first_name || ""
                })
            });

        const data =
            await response.json();

        if (!response.ok || !data.ok) {

            isSpinning = false;

            spinButton.disabled = false;

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

                showAlert(
                    "⏳ Следующая прокрутка через " +
                    hours +
                    " ч. " +
                    minutes +
                    " мин."
                );

            } else {

                showAlert(
                    data.error ||
                    "Прокрутка недоступна."
                );
            }

            return;
        }

        const prize =
            data.prize;

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";

        startProgress();

        animateWheel(prize);

        setTimeout(function() {

            showResult(prize);

        }, 5700);

    } catch (error) {

        console.error(
            "SPIN ERROR:",
            error
        );

        isSpinning = false;

        spinButton.disabled = false;

        showScreen(homeScreen);

        showAlert(
            "❌ Ошибка соединения с сервером."
        );
    }
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

console.log(
    "CRYPTO ROULETTE READY"
);
