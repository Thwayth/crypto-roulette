/* ==========================================
   CRYPTO ROULETTE
   Версия без сервера
========================================== */


/* ==========================================
   TELEGRAM
========================================== */

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();

    try {
        tg.setHeaderColor("#050608");
        tg.setBackgroundColor("#050608");
    } catch (error) {
        console.log(error);
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
   STORAGE
========================================== */

/*
    Один бесплатный spin.

    Используем localStorage.

    Если пользователь очистит данные браузера,
    бесплатная попытка появится снова.
*/

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
    document.getElementById(
        "homeScreen"
    );

const rouletteScreen =
    document.getElementById(
        "rouletteScreen"
    );

const resultScreen =
    document.getElementById(
        "resultScreen"
    );


const spinButton =
    document.getElementById(
        "spinButton"
    );


const repeatHomeButton =
    document.getElementById(
        "repeatHomeButton"
    );


const spinAgainButton =
    document.getElementById(
        "spinAgainButton"
    );


const repeatResultButton =
    document.getElementById(
        "repeatResultButton"
    );


const backButton =
    document.getElementById(
        "backButton"
    );


const wheel =
    document.getElementById(
        "wheel"
    );


const spinStatus =
    document.getElementById(
        "spinStatus"
    );


const progressBar =
    document.getElementById(
        "progressBar"
    );


const resultIcon =
    document.getElementById(
        "resultIcon"
    );


const resultName =
    document.getElementById(
        "resultName"
    );


const resultDescription =
    document.getElementById(
        "resultDescription"
    );


const claimButton =
    document.getElementById(
        "claimButton"
    );


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

    homeScreen.classList.remove(
        "active"
    );

    rouletteScreen.classList.remove(
        "active"
    );

    resultScreen.classList.remove(
        "active"
    );

    screen.classList.add(
        "active"
    );

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* ==========================================
   HAPTIC
========================================== */

function haptic(
    type = "light"
) {

    if (
        !tg ||
        !tg.HapticFeedback
    ) {
        return;
    }

    try {

        if (
            type === "success"
        ) {

            tg.HapticFeedback
                .notificationOccurred(
                    "success"
                );

        } else if (
            type === "error"
        ) {

            tg.HapticFeedback
                .notificationOccurred(
                    "error"
                );

        } else {

            tg.HapticFeedback
                .impactOccurred(
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

    for (
        const prize of prizes
    ) {

        cumulative +=
            prize.chance;

        if (
            random < cumulative
        ) {

            return prize;

        }

    }

    return prizes[
        prizes.length - 1
    ];

}


/* ==========================================
   WHEEL LABELS
========================================== */

function createWheelLabels() {

    /*
        Защита от повторного создания
        подписей, если скрипт загрузится
        повторно.
    */

    const existingLabels =
        wheel.querySelectorAll(
            ".wheel-label"
        );

    existingLabels.forEach(
        element => element.remove()
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


    labels.forEach(
        item => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                `wheel-label ${item.className}`;

            element.innerHTML =
                item.text;

            wheel.appendChild(
                element
            );

        }
    );

}


/* ==========================================
   BUTTON STATE
========================================== */

function updateButtons() {

    const freeAvailable =
        !isFreeSpinUsed();


    /*
        HOME
    */

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


    /*
        ROULETTE
    */

    spinAgainButton.innerHTML =
        "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";


    /*
        RESULT
    */

    repeatResultButton.innerHTML =
        "☆ КРУТИТЬ ЕЩЁ РАЗ ЗА 100 ⭐";

}


/* ==========================================
   PROGRESS
========================================== */

function animateProgress(
    duration
) {

    progressBar.style.width =
        "0%";


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


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/* ==========================================
   WHEEL ANIMATION
========================================== */

function animateWheel(
    prize
) {

    const prizeIndex =
        prizes.findIndex(
            item =>
                item.id === prize.id
        );


    const sectorSize =
        360 / prizes.length;


    const sectorCenter =
        prizeIndex *
            sectorSize +
        sectorSize / 2;


    const targetAngle =
        360 -
        sectorCenter;


    /*
        Добавляем 5–7 полных оборотов.
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
        Небольшая случайность внутри
        сектора, чтобы вращение не выглядело
        одинаковым каждый раз.
    */

    const randomOffset =
        (Math.random() - 0.5) *
        (sectorSize * 0.5);


    const finalRotation =
        currentRotation +
        extraRotations +
        targetAngle +
        randomOffset;


    currentRotation =
        finalRotation;


    wheel.style.transform =
        `rotate(${finalRotation}deg)`;

}


/* ==========================================
   SPIN
========================================== */

function spinRoulette() {

    if (isSpinning) {
        return;
    }


    /*
        Проверяем бесплатную попытку.
    */

    if (
        isFreeSpinUsed()
    ) {

        showPaidMessage();

        return;

    }


    /*
        Забираем бесплатную попытку
        ДО запуска анимации.

        Поэтому перезагрузка страницы
        во время spin не даст новую попытку.
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
        Результат определяется
        один раз перед анимацией.
    */

    const selectedPrize =
        getRandomPrize();


    lastPrize =
        selectedPrize;


    animateWheel(
        selectedPrize
    );


    setTimeout(
        () => {

            showResult(
                selectedPrize
            );

        },
        5700
    );

}


/* ==========================================
   RESULT
========================================== */

function showResult(
    prize
) {

    isSpinning = false;


    resultIcon.textContent =
        prize.icon;


    resultName.textContent =
        prize.name;


    resultDescription.textContent =
        prize.description;


    enableButtons();


    updateButtons();


    haptic("success");


    showScreen(
        resultScreen
    );

}


/* ==========================================
   PAID MESSAGE
========================================== */

function showPaidMessage() {

    haptic("light");


    const message =
        "⭐ Повторная прокрутка\n\n" +
        "Следующая прокрутка будет " +
        "доступна за 100 Stars.\n\n" +
        "Оплата Stars будет подключена " +
        "на следующем этапе.";


    if (
        tg
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


    alert(
        message
    );

}


/* ==========================================
   CLAIM
========================================== */

function claimPrize() {

    haptic("light");


    const telegramUrl =
        "https://t.me/Andrey_AItrade";


    if (
        tg &&
        tg.openTelegramLink
    ) {

        tg.openTelegramLink(
            telegramUrl
        );

    } else {

        window.open(
            telegramUrl,
            "_blank"
        );

    }

}


/* ==========================================
   BUTTON CONTROL
========================================== */

function disableButtons() {

    spinButton.disabled =
        true;

    spinAgainButton.disabled =
        true;

    repeatHomeButton.disabled =
        true;

    repeatResultButton.disabled =
        true;

}


function enableButtons() {

    spinButton.disabled =
        false;

    spinAgainButton.disabled =
        false;

    repeatHomeButton.disabled =
        false;

    repeatResultButton.disabled =
        false;

}


/* ==========================================
   REPEAT
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


backButton.addEventListener(
    "click",
    () => {

        if (!isSpinning) {

            showScreen(
                homeScreen
            );

            updateButtons();

        }

    }
);


claimButton.addEventListener(
    "click",
    claimPrize
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


/* ==========================================
   INITIALIZE
========================================== */

createWheelLabels();

updateButtons();

showScreen(
    homeScreen
);
