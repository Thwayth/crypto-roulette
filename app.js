const tg =
    window.Telegram.WebApp;


tg.ready();

tg.expand();


const wheel =
    document.getElementById(
        "wheel"
    );


const spinButton =
    document.getElementById(
        "spinButton"
    );


const result =
    document.getElementById(
        "result"
    );


const resultValue =
    document.getElementById(
        "resultValue"
    );


let rotation = 0;


spinButton.addEventListener(
    "click",
    spin
);


async function spin() {

    spinButton.disabled = true;

    result.classList.add(
        "hidden"
    );


    /*
    Пока сервера нет.

    Поэтому для теста
    результат выбирается
    случайно.
    */

    const results = [

        {
            name: "🐂 BULLISH",
            angle: 30
        },

        {
            name: "🐻 BEARISH",
            angle: 90
        },

        {
            name: "🐋 WHALE ALERT",
            angle: 150
        },

        {
            name: "💎 GEM",
            angle: 210
        },

        {
            name: "🔥 DEGEN",
            angle: 270
        },

        {
            name: "👀 WATCHLIST",
            angle: 330
        }

    ];


    const random =
        Math.floor(
            Math.random() *
            results.length
        );


    const selected =
        results[random];


    rotation +=
        360 * 6 +
        selected.angle;


    wheel.style.transform =
        `rotate(${rotation}deg)`;


    setTimeout(() => {

        resultValue.innerText =
            selected.name;


        result.classList.remove(
            "hidden"
        );


        spinButton.disabled =
            false;

    }, 5200);

}