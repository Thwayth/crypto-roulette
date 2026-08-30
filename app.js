```javascript
/* =========================================================
   🎰 CRYPTO ROULETTE
   Telegram Mini App + Telegram Stars
   ========================================================= */


/* =========================================================
   TELEGRAM WEB APP
   ========================================================= */

const tg = window.Telegram?.WebApp;

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


/* =========================================================
   🎁 ПРИЗЫ
   ========================================================= */

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


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

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


/* =========================================================
   STATE
   ========================================================= */

let isSpinning = false;

let currentRotation = 0;


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(element => {
            element.classList.remove("active");
        });

    if (screen) {
        screen.classList.add("active");
    }

    window.scrollTo(0, 0);
}


/* =========================================================
   HAPTIC FEEDBACK
   ========================================================= */

function haptic(type = "light") {

    if (!tg?.HapticFeedback) {
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
        console.log("Haptic error:", error);
    }
}


/* =========================================================
   🎲 ВЫБОР СЛУЧАЙНОГО ПРИЗА
   ========================================================= */

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


/* =========================================================
   🏷️ НАДПИСИ НА КОЛЕСЕ
   ========================================================= */

function createWheelLabels() {

    if (!wheel) {
        return;
    }

    wheel
        .querySelectorAll(".wheel-label")
        .forEach(label => {
            label.remove();
        });


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

        const label =
            document.createElement("div");

        label.className =
            `wheel-label ${item.className}`;

        label.innerHTML =
            item.text;

        wheel.appendChild(label);
    });
}


/* =========================================================
   🔒 БЛОКИРОВКА КНОПОК
   ========================================================= */

function setButtonsDisabled(disabled) {

    const buttons = [

        spinButton,

        repeatHomeButton,

        spinAgainButton,

        repeatResultButton
    ];


    buttons.forEach(button => {

        if (button) {
            button.disabled = disabled;
        }
    });
}


/* =========================================================
   🎰 АНИМАЦИЯ РУЛЕТКИ
   ========================================================= */

function animateWheel(prize) {

    if (!wheel) {
        console.error("Wheel element not found");
        return;
    }


    /*
       Определяем сектор приза
    */

    const prizeIndex =
        prizes.findIndex(
            item => item.id === prize.id
        );


    const sectorSize =
        360 / prizes.length;


    /*
       Центр нужного сектора
    */

    const sectorCenter =
        prizeIndex * sectorSize +
        sectorSize / 2;


    /*
       Поворачиваем сектор
       к верхнему указателю
    */

    const targetAngle =
        360 - sectorCenter;


    /*
       6–7 полных оборотов
    */

    const fullRotations =
        360 *
        (
            6 +
            Math.floor(
                Math.random() * 2
            )
        );


    /*
       Небольшая случайность
       внутри выбранного сектора
    */

    const randomOffset =
        (
            Math.random() - 0.5
        ) *
        sectorSize *
        0.5;


    /*
       Начальный угол.
       Не даём числу становиться огромным.
    */

    currentRotation =
        currentRotation % 360;


    /*
       Финальный угол
    */

    const finalRotation =
        currentRotation +
        fullRotations +
        targetAngle +
        randomOffset;


    currentRotation =
        finalRotation;


    /*
       Сначала убираем transition
    */

    wheel.style.transition =
        "none";


    /*
       Ставим колесо
       в текущую позицию
    */

    wheel.style.transform =
        `rotate(${currentRotation % 360}deg)`;


    /*
       Принудительная перерисовка.
       Особенно важно для Telegram WebView.
    */

    void wheel.offsetWidth;


    /*
       Включаем плавное вращение
    */

    wheel.style.transition =
        "transform 5.5s cubic-bezier(0.12, 0.72, 0.18, 1)";


    /*
       Запускаем вращение
    */

    wheel.style.transform =
        `rotate(${finalRotation}deg)`;


    /*
       Прогресс-бар
    */

    if (progressBar) {

        progressBar.style.transition =
            "none";

        progressBar.style.width =
            "0%";


        void progressBar.offsetWidth;


        progressBar.style.transition =
            "width 5.5s linear";

        progressBar.style.width =
            "100%";
    }
}


/* =========================================================
   🆓 БЕСПЛАТНАЯ ПРОКРУТКА
   ========================================================= */

function spinRoulette() {

    if (isSpinning) {
        return;
    }


    isSpinning = true;


    setButtonsDisabled(true);


    haptic("light");


    /*
       Открываем экран рулетки
    */

    showScreen(
        rouletteScreen
    );


    /*
       Меняем статус
    */

    if (spinStatus) {

        spinStatus.textContent =
            "РУЛЕТКА КРУТИТСЯ...";
    }


    /*
       Выбираем приз
    */

    const selectedPrize =
        getRandomPrize();


    /*
       Запускаем анимацию
    */

    animateWheel(
        selectedPrize
    );


    /*
       После окончания анимации
       показываем результат
    */

    setTimeout(() => {

        showResult(
            selectedPrize
        );

    }, 5700);
}


/* =========================================================
   🏆 ПОКАЗАТЬ РЕЗУЛЬТАТ
   ========================================================= */

function showResult(prize) {

    isSpinning = false;


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


    if (spinStatus) {

        spinStatus.textContent =
            "ГОТОВО!";
    }


    setButtonsDisabled(false);


    haptic("success");


    showScreen(
        resultScreen
    );
}


/* =========================================================
   ⭐ ОПЛАТА TELEGRAM STARS
   ========================================================= */

async function payStars() {

    if (isSpinning) {
        return;
    }


    /*
       Mini App должен быть открыт
       внутри Telegram.
    */

    if (!tg) {

        alert(
            "Открой Mini App внутри Telegram."
        );

        return;
    }


    try {

        haptic("light");


        /*
           Просим сервер создать invoice
        */

        const response =
            await fetch(
                "/create-invoice",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        user_id:
                            tg.initDataUnsafe
                                ?.user
                                ?.id || ""
                    })
                }
            );


        const data =
            await response.json();


        /*
           Проверяем ответ сервера
        */

        if (
            !response.ok ||
            !data.url
        ) {

            throw new Error(
                data.error ||
                "Не удалось создать оплату"
            );
        }


        /*
           Открываем окно оплаты Stars
        */

        tg.openInvoice(
            data.url,
            function(status) {

                console.log(
                    "⭐ Payment status:",
                    status
                );


                /*
                   Оплата прошла
                */

                if (status === "paid") {

                    haptic("success");


                    /*
                       После оплаты
                       запускаем рулетку
                    */

                    spinRoulette();
                }


                /*
                   Оплата не прошла
                */

                if (status === "failed") {

                    tg.showAlert?.(
                        "❌ Оплата не прошла."
                    );
                }


                /*
                   Пользователь закрыл оплату
                */

                if (
                    status === "cancelled"
                ) {

                    console.log(
                        "Payment cancelled"
                    );
                }
            }
        );

    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        tg.showAlert?.(
            "❌ Не удалось открыть оплату.\n\n" +
            "Попробуйте ещё раз."
        );
    }
}


/* =========================================================
   🎁 ЗАБРАТЬ ПРИЗ
   ========================================================= */

function claimPrize() {

    const telegramUrl =
        "https://t.me/Andrey_AItrade";


    if (
        tg &&
        typeof tg.openTelegramLink === "function"
    ) {

        tg.openTelegramLink(
            telegramUrl
        );

        return;
    }


    window.open(
        telegramUrl,
        "_blank"
    );
}


/* =========================================================
   🔘 КНОПКИ
   ========================================================= */


/*
   Бесплатная прокрутка
*/

if (spinButton) {

    spinButton.addEventListener(
        "click",
        spinRoulette
    );
}


/*
   Прокрутка за Stars
*/

if (repeatHomeButton) {

    repeatHomeButton.addEventListener(
        "click",
        payStars
    );
}


if (spinAgainButton) {

    spinAgainButton.addEventListener(
        "click",
        payStars
    );
}


if (repeatResultButton) {

    repeatResultButton.addEventListener(
        "click",
        payStars
    );
}


/*
   Назад
*/

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            if (isSpinning) {
                return;
            }

            showScreen(
                homeScreen
            );
        }
    );
}


/*
   Забрать приз
*/

if (claimButton) {

    claimButton.addEventListener(
        "click",
        claimPrize
    );
}


/* =========================================================
   🚀 ЗАПУСК
   ========================================================= */

createWheelLabels();

showScreen(
    homeScreen
);


console.log(
    "🎰 CRYPTO ROULETTE READY"
);
```
