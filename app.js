/* ==========================================
   CRYPTO ROULETTE
   Версия без сервера
========================================== */

const tg = window.Telegram?.WebApp;


/* ==========================================
   TELEGRAM
========================================== */

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (error) {
        console.log("Telegram UI:", error);
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
   FREE SPIN STORAGE
========================================== */

const FREE_SPIN_KEY =
    "crypto_roulette_free_spin_used_v1";


function isFreeSpinUsed() {
    return localStorage.getItem(
        FREE_SPIN_KEY
    ) === "1";
}


function markFreeSpinUsed() {
    localStorage.setItem(
        FREE_SPIN_KEY,
        "1"
    );
}


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

let lastPrize = null;


/* ==========================================
   SCREEN MANAGEMENT
========================================== */

function showScreen(screen) {

    homeScreen.classList.remove("active");
    rouletteScreen.classList.remove("active");
    resultScreen.classList.remove("active");

    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


/* ==========================================
   HAPTIC
========================================== */

function haptic(type = "light") {

    if (!tg || !tg.HapticFeedback) {
        return;
    }

    try {

        if (type === "success") {

            tg.HapticFeedback.notificationOccurred(
                "success"
            );

        } else if (type === "error") {

            tg.HapticFeedback.notificationOccurred(
                "error"
            );

        } else {

            tg.HapticFeedback.impactOccurred(
                "light"
            );

        }

    } catch (error) {
        console.log(error);
    }
}


/* ==========================================
   RANDOM PRIZE
========================================== */

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


/* ==========================================
   WHEEL LABELS
========================================== */

function createWheelLabels() {

    const oldLabels =
        wheel.querySelectorAll(".wheel-label");

    oldLabels.forEach(
        label => label.remove()
    );


    const labels = [
        {
            className: "one",
            text: "🏆<br>$1,000"
        },
        {
            className: "two",
            text: "💎<br>VIP"
        },
        {
            className: "three",
            text: "🔥<br>МАРАФОН"
        },
        {
            className: "four",
            text: "📈<br>СИГНАЛ<br>300%"
        },
        {
            className: "five",
            text: "🎓<br>ОБУЧЕНИЕ"
        }
    ];


    labels.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            `wheel-label ${item.className}`;

        element.innerHTML =
            item.text;

        wheel.appendChild(element);

    });
}


/* ==========================================
   BUTTONS
========================================== */

function updateButtons() {

    const freeAvailable =
        !isFreeSpinUsed();


    if (freeAvailable) {

        spinButton.style.display =
            "block";

        repeatHomeButton.style.display =
            "none";

        spinButton.innerHTML =
            "<span>◎</span> КРУТИТЬ БЕСПЛАТНО";

    } else {

        spinButton.style.display =
            "none";

        repeatHomeButton.style.display =
            "block";

        repeatHomeButton.innerHTML =
            "<span>☆</span> КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";

    }


    spinAgainButton.innerHTML =
        "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";


    repeatResultButton.innerHTML =
        "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";
}


/* ==========================================
   ENABLE / DISABLE
========================================== */

function disableButtons() {

    spinButton.disabled = true;
    repeatHomeButton.disabled = true;
    spinAgainButton.disabled = true;
    repeatResultButton.disabled = true;

}


function enableButtons() {

    spinButton.disabled = false;
    repeatHomeButton.disabled = false;
    spinAgainButton.disabled = false;
    repeatResultButton.disabled = false;

}


/* ==========================================
   PROGRESS
========================================== */

function animateProgress(duration) {

    progressBar.style.width = "0%";

    const start =
        performance.now();


    function update(time) {

        const elapsed =
            time - start;


        const progress =
            Math.min(
                elapsed / duration,
                1
            );


        progressBar.style.width =
            `${progress * 100}%`;


        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }


    requestAnimationFrame(update);
}


/* ==========================================
   PREPARE WHEEL
========================================== */

function prepareWheel() {

    /*
        Убираем transition перед новым spin,
        чтобы браузер точно видел начальную
        точку вращения.
    */

    wheel.style.transition =
        "none";

    wheel.style.willChange =
        "transform";

    wheel.style.transform =
        `translate3d(0, 0, 0) rotate(${currentRotation}deg)`;


    /*
        Принудительная перерисовка.

        Это помогает на iPhone / Android
        внутри Telegram Mini App.
    */

    void wheel.offsetWidth;

}


/* ==========================================
   ANIMATE WHEEL
========================================== */

function animateWheel(prize) {

    const prizeIndex =
        prizes.findIndex(
            item =>
                item.id === prize.id
        );


    const sectorSize =
        360 / prizes.length;


    /*
        Центр выбранного сектора.
    */

    const sectorCenter =
        prizeIndex *
        sectorSize +
        sectorSize / 2;


    /*
        Верхняя точка = 0 градусов.
    */

    const targetAngle =
        360 -
        sectorCenter;


    /*
        5–7 полных оборотов.
    */

    const extraRotations =
        360 *
        (
            5 +
            Math.floor(
                Math.random() * 3
            )
        );


    /*
        Случайная позиция внутри сектора.
    */

    const randomOffset =
        (
            Math.random() - 0.5
        ) *
        (
            sectorSize * 0.45
        );


    let finalRotation =
        currentRotation +
        extraRotations +
        targetAngle +
        randomOffset;


    /*
        Нормализуем вращение.

        Это предотвращает слишком большие
        значения transform после нескольких spin.
    */

    if (finalRotation > 100000) {

        currentRotation =
            currentRotation % 360;

        finalRotation =
            currentRotation +
            extraRotations +
            targetAngle +
            randomOffset;

    }


    currentRotation =
        finalRotation;


    /*
        Возвращаем аппаратное ускорение.
    */

    wheel.style.willChange =
        "transform";


    /*
        Transition задаём прямо через JS.
        Это делает вращение стабильнее
        в Telegram WebView.
    */

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";


    /*
        Вращение через translate3d + rotate.
    */

    wheel.style.transform =
        `translate3d(0, 0, 0) rotate(${finalRotation}deg)`;

}


/* ==========================================
   SPIN
========================================== */

function spinRoulette() {

    if (isSpinning) {
        return;
    }


    /*
        Бесплатный spin уже использован?
    */

    if (isFreeSpinUsed()) {

        showPaidMessage();

        return;
    }


    /*
        Сразу отмечаем бесплатную попытку
        использованной.
    */

    markFreeSpinUsed();


    updateButtons();


    isSpinning = true;


    disableButtons();


    haptic("light");


    showScreen(
        rouletteScreen
    );


    spinStatus.textContent =
        "РУЛЕТКА КРУТИТСЯ...";


    animateProgress(
        5500
    );


    /*
        Выбираем результат.
    */

    const selectedPrize =
        getRandomPrize();


    lastPrize =
        selectedPrize;


    /*
        Сначала подготавливаем колесо.
    */

    prepareWheel();


    /*
        Небольшая задержка перед стартом
        помогает Telegram WebView
        корректно применить transition.
    */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            animateWheel(
                selectedPrize
            );

        });

    });


    /*
        Показываем результат после
        завершения вращения.
    */

    setTimeout(() => {

        showResult(
            selectedPrize
        );

    }, 5700);

}


/* ==========================================
   RESULT
========================================== */

function showResult(prize) {

    isSpinning = false;


    resultIcon.textContent =
        prize.icon;


    resultName.textContent =
        prize.name;


    resultDescription.textContent =
        prize.description;


    enableButtons();


    updateButtons();


    /*
        Можно убрать will-change
        после окончания анимации.
    */

    setTimeout(() => {

        wheel.style.willChange =
            "auto";

    }, 300);


    haptic("success");


    showScreen(
        resultScreen
    );

}


/* ==========================================
   PAID SPIN MESSAGE
========================================== */

function showPaidMessage() {

    haptic("light");


    const message =
        "⭐ КРУТИТЬ ЕЩЁ РАЗ\n\n" +
        "Следующая прокрутка стоит 100 Stars.\n\n" +
        "Оплата Stars будет подключена " +
        "на следующем этапе.";


    if (
        tg &&
        typeof tg.showAlert === "function"
    ) {

        try {

            tg.showAlert(
                message
            );

            return;

        } catch (error) {

            console.log(error);

        }

    }


    alert(message);

}


/* ==========================================
   CLAIM PRIZE
========================================== */

function claimPrize() {

    haptic("light");


    const telegramUrl =
        "https://t.me/Andrey_AItrade";


    if (
        tg &&
        typeof tg.openTelegramLink === "function"
    ) {

        try {

            tg.openTelegramLink(
                telegramUrl
            );

            return;

        } catch (error) {

            console.log(error);

        }

    }


    window.open(
        telegramUrl,
        "_blank"
    );

}


/* ==========================================
   REPEAT BUTTON
========================================== */

function requestPaidSpin() {

    if (isSpinning) {
        return;
    }


    showPaidMessage();

}


/* ==========================================
   EVENTS
========================================== */

spinButton.addEventListener(
    "click",
    spinRoulette
);


repeatHomeButton.addEventListener(
    "click",
    requestPaidSpin
);


spinAgainButton.addEventListener(
    "click",
    requestPaidSpin
);


repeatResultButton.addEventListener(
    "click",
    requestPaidSpin
);


backButton.addEventListener(
    "click",
    () => {

        if (isSpinning) {
            return;
        }


        showScreen(
            homeScreen
        );


        updateButtons();

    }
);


claimButton.addEventListener(
    "click",
    claimPrize
);


/* ==========================================
   INITIALIZE
========================================== */

createWheelLabels();

updateButtons();

showScreen(
    homeScreen
);
