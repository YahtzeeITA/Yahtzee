const TOTAL_CATEGORIES = 13;

let bonusUnlockedP1 = false;
let bonusUnlockedP2 = false;

const EMPTY_SCORE_CARD = () => ({

    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,

    threeKind: null,
    fourKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yahtzee: null,
    chance: null

});

const game = {

    mode: 1,

    playerNames: [
        "Giocatore 1",
        "Giocatore 2"
    ],

    currentPlayer: 0,

    dice: [1, 2, 3, 4, 5],

    locked: [
        false,
        false,
        false,
        false,
        false
    ],

    rollsLeft: 3,

    turn: 1,

    scores: [

        EMPTY_SCORE_CARD(),

        EMPTY_SCORE_CARD()

    ]

};
/* =====================================
   DOM
===================================== */

const diceElements =
    document.querySelectorAll(".die");

const rollButton =
    document.getElementById("rollButton");

const totalScoreElement =
    document.getElementById("totalScore");

const turnNumberElement =
    document.getElementById("turnNumber");

const rollsLeftElement =
    document.getElementById("rollsLeft");

const currentPlayerElement =
    document.getElementById("currentPlayer");

const onePlayerBtn =
    document.getElementById("onePlayerBtn");

const twoPlayersBtn =
    document.getElementById("twoPlayersBtn");

const playerSetup =
    document.getElementById("playerSetup");

const player1NameInput =
    document.getElementById("player1Name");

const player2NameInput =
    document.getElementById("player2Name");

const player1Header =
    document.getElementById("player1Header");

const player2Header =
    document.getElementById("player2Header");

/* =====================================
   AUDIO
===================================== */

const rollSound =
    document.getElementById("rollSound");

const lockSound =
    document.getElementById("lockSound");

const scoreSound =
    document.getElementById("scoreSound");

const winSound =
    document.getElementById("winSound");

/* =====================================
   INIT
===================================== */

init();

function getCurrentScores() {

    return game.scores[
        game.currentPlayer
    ];

}

function getPlayerScores(index) {

    return game.scores[index];

}

function getCurrentPlayerName() {

    return game.playerNames[
        game.currentPlayer
    ];

}

function getOpponentPlayer() {

    return game.currentPlayer === 0
        ? 1
        : 0;

}

function init() {

    loadGame();

    bindDice();

    bindCategories();

    bindMultiplayer();

    updateDiceUI();

    updatePreviews();

    updateHeader();

    updatePlayerHeaders();
}

function bindMultiplayer() {

    onePlayerBtn.addEventListener(
        "click",
        () => {

            game.mode = 1;

            onePlayerBtn.classList.add(
                "active"
            );

            twoPlayersBtn.classList.remove(
                "active"
            );

            playerSetup.classList.remove(
                "show"
            );

            saveGame();
        }
    );

    twoPlayersBtn.addEventListener(
        "click",
        () => {

            game.mode = 2;

            twoPlayersBtn.classList.add(
                "active"
            );

            onePlayerBtn.classList.remove(
                "active"
            );

            playerSetup.classList.add(
                "show"
            );

            saveGame();
        }
    );

    player1NameInput.addEventListener(
        "input",
        () => {

            game.playerNames[0] =
                player1NameInput.value ||
                "Giocatore 1";

            updatePlayerHeaders();

            saveGame();
        }
    );

    player2NameInput.addEventListener(
        "input",
        () => {

            game.playerNames[1] =
                player2NameInput.value ||
                "Giocatore 2";

            updatePlayerHeaders();

            saveGame();
        }
    );
}

function updatePlayerHeaders() {

    player1Header.textContent =
        game.playerNames[0];

    player2Header.textContent =
        game.playerNames[1];

    player1Header.classList.remove(
        "active-player"
    );

    player2Header.classList.remove(
        "active-player"
    );

    if (
        game.mode === 2
    ) {

        if (
            game.currentPlayer === 0
        ) {

            player1Header.classList.add(
                "active-player"
            );

        } else {

            player2Header.classList.add(
                "active-player"
            );
        }

    }
}
/* =====================================
   DICE EVENTS
===================================== */

function bindDice() {

    diceElements.forEach(die => {

        die.addEventListener("click", () => {

            if (game.rollsLeft === 3)
                return;

            const index =
                Number(die.dataset.index);

            game.locked[index] =
                !game.locked[index];

            die.classList.toggle("locked");

            playSound(lockSound);

            saveGame();
        });

    });
}

/* =====================================
   ROLL
===================================== */

rollButton.addEventListener(
    "click",
    rollDice
);

function rollDice() {

    if (game.rollsLeft <= 0)
        return;

    playSound(rollSound);

    diceElements.forEach((die, index) => {

        if (game.locked[index])
            return;

        die.classList.add("rolling");

        setTimeout(() => {

            game.dice[index] =
                randomDie();

            die.classList.remove("rolling");

            updateSingleDie(index);

        }, 700);

    });

    game.rollsLeft--;

    setTimeout(() => {

        updatePreviews();
        updateHeader();
        saveGame();

    }, 720);
}

function randomDie() {

    return (
        Math.floor(
            Math.random() * 6
        ) + 1
    );
}

/* =====================================
   UI DICE
===================================== */

function updateDiceUI() {

    diceElements.forEach((die, index) => {

        die.querySelector(".value")
            .textContent =
            game.dice[index];

        die.classList.toggle(
            "locked",
            game.locked[index]
        );

    });
}

function updateSingleDie(index) {

    const die =
        diceElements[index];

    die.querySelector(".value")
        .textContent =
        game.dice[index];
}

/* =====================================
   SCORE CALCULATIONS
===================================== */

function countOccurrences() {

    const counts = {};

    game.dice.forEach(value => {

        counts[value] =
            (counts[value] || 0) + 1;

    });

    return counts;
}

/* =====================================
   UPPER SECTION
===================================== */

function calculateUpperSection(number) {

    return game.dice
        .filter(v => v === number)
        .reduce(
            (a, b) => a + b,
            0
        );
}

/* =====================================
   THREE OF A KIND
===================================== */

function calculateThreeOfAKind() {

    const counts =
        Object.values(
            countOccurrences()
        );

    const valid =
        counts.some(c => c >= 3);

    if (!valid)
        return 0;

    return sumDice();
}

/* =====================================
   FOUR OF A KIND
===================================== */

function calculateFourOfAKind() {

    const counts =
        Object.values(
            countOccurrences()
        );

    const valid =
        counts.some(c => c >= 4);

    if (!valid)
        return 0;

    return sumDice();
}

/* =====================================
   FULL HOUSE
===================================== */

function calculateFullHouse() {

    const values =
        Object.values(
            countOccurrences()
        ).sort();

    const result =
        JSON.stringify(values)
        ===
        JSON.stringify([2, 3]);

    return result
        ? 25
        : 0;
}

/* =====================================
   SMALL STRAIGHT
===================================== */

function calculateSmallStraight() {

    const unique =
        [...new Set(game.dice)]
            .sort();

    const text =
        unique.join("");

    if (
        text.includes("1234") ||
        text.includes("2345") ||
        text.includes("3456")
    ) {
        return 30;
    }

    return 0;
}

/* =====================================
   LARGE STRAIGHT
===================================== */

function calculateLargeStraight() {

    const sorted =
        [...new Set(game.dice)]
            .sort()
            .join("");

    if (
        sorted === "12345" ||
        sorted === "23456"
    ) {
        return 40;
    }

    return 0;
}

/* =====================================
   YAHTZEE
===================================== */

function calculateYahtzee() {

    const counts =
        Object.values(
            countOccurrences()
        );

    const valid =
        counts.some(c => c === 5);

    return valid
        ? 50
        : 0;
}

/* =====================================
   CHANCE
===================================== */

function calculateChance() {

    return sumDice();
}

function sumDice() {

    return game.dice.reduce(
        (a, b) => a + b,
        0
    );
}

/* =====================================
   BONUS
===================================== */

function calculateUpperTotal(playerIndex = 0) {

    const scores =
        game.scores[playerIndex];

    if (!scores)
        return 0;

    return (

        (scores.ones || 0) +
        (scores.twos || 0) +
        (scores.threes || 0) +
        (scores.fours || 0) +
        (scores.fives || 0) +
        (scores.sixes || 0)

    );
}

function calculateBonus(
    playerIndex
) {

    return calculateUpperTotal(
        playerIndex
    ) >= 63
        ? 35
        : 0;
}

/* =====================================
   TOTAL SCORE
===================================== */

function calculateTotalScore(
    playerIndex
) {

    let total = 0;

    Object.values(
        game.scores[playerIndex]
    )
        .forEach(score => {

            if (score !== null)
                total += score;

        });

    total += calculateBonus(
        playerIndex
    );

    return total;
}

/* =====================================
   CATEGORY PREVIEW
===================================== */

function getCategoryScore(category) {

    switch (category) {

        case "ones":
            return calculateUpperSection(1);

        case "twos":
            return calculateUpperSection(2);

        case "threes":
            return calculateUpperSection(3);

        case "fours":
            return calculateUpperSection(4);

        case "fives":
            return calculateUpperSection(5);

        case "sixes":
            return calculateUpperSection(6);

        case "threeKind":
            return calculateThreeOfAKind();

        case "fourKind":
            return calculateFourOfAKind();

        case "fullHouse":
            return calculateFullHouse();

        case "smallStraight":
            return calculateSmallStraight();

        case "largeStraight":
            return calculateLargeStraight();

        case "yahtzee":
            return calculateYahtzee();

        case "chance":
            return calculateChance();

        default:
            return 0;
    }
}

/* =====================================
   PREVIEWS
===================================== */

function updatePreviews() {

    const currentScores =
        game.scores[
        game.currentPlayer
        ];

    document
        .querySelectorAll(".category-row")
        .forEach(row => {

            const category =
                row.dataset.category;

            const preview =
                row.querySelector(
                    ".preview-cell"
                );

            if (
                currentScores[category]
                !== null
            ) {

                preview.textContent = "";
                return;
            }

            const score =
                getCategoryScore(
                    category
                );

            preview.textContent =
                score;

            preview.classList.remove(
                "preview-valid",
                "preview-zero"
            );

            preview.classList.add(
                score > 0
                    ? "preview-valid"
                    : "preview-zero"
            );
        });

    updateBonusUI();
}

/* =====================================
   CATEGORY EVENTS
===================================== */

function bindCategories() {

    document
        .querySelectorAll(".category-row")
        .forEach(row => {

            row.addEventListener(
                "click",
                () => assignCategory(row)
            );

        });
}

function assignCategory(row) {

    const category =
        row.dataset.category;

    if (game.rollsLeft === 3)
        return;

    const playerScores =
        game.scores[
        game.currentPlayer
        ];

    if (
        playerScores[category] !== null
    )
        return;

    const score =
        getCategoryScore(category);

    playerScores[category] =
        score;

    const scoreCell =
        game.currentPlayer === 0
            ? row.querySelector(
                ".score-cell-p1"
            )
            : row.querySelector(
                ".score-cell-p2"
            );

    scoreCell.textContent =
        score;

    playSound(scoreSound);

    if (
        category === "yahtzee" &&
        score === 50
    ) {
        increaseYahtzeeCount();
    }

    if (game.mode === 2) {

        game.currentPlayer =
            game.currentPlayer === 0
                ? 1
                : 0;
    }

    resetTurn();

    animateTotal();

    updatePreviews();

    updateHeader();

    saveGame();

    checkGameEnd();
}

/* =====================================
   TURN RESET
===================================== */

function resetTurn() {

    game.turn++;

    game.rollsLeft = 3;

    game.locked = [
        false,
        false,
        false,
        false,
        false
    ];

    diceElements.forEach(die => {

        die.classList.remove(
            "locked"
        );

    });

    updateDiceUI();

    updateHeader();
}
/* =====================================
   HEADER
===================================== */

function updateHeader() {

    turnNumberElement.textContent =
        game.turn;

    rollsLeftElement.textContent =
        game.rollsLeft;

    totalScoreElement.textContent =
        calculateTotalScore(
            game.currentPlayer
        );

    if (
        currentPlayerElement
    ) {

        currentPlayerElement
            .textContent =
            game.playerNames[
            game.currentPlayer
            ];
    }

    updatePlayerHeaders();
    rollButton.disabled =
        game.rollsLeft <= 0;
}
/* =====================================
   TOTAL ANIMATION
===================================== */

function animateTotal() {

    const target =
        calculateTotalScore(
            game.currentPlayer
        );

    const current =
        Number(
            totalScoreElement.textContent
        ) || 0;

    let value = current;

    const interval =
        setInterval(() => {

            value++;

            totalScoreElement.textContent =
                value;

            if (value >= target) {

                clearInterval(interval);

                totalScoreElement.textContent =
                    target;
            }

        }, 10);
}
/* =====================================
   BONUS UI
===================================== */

function updateBonusUI() {

    const p1Upper =
        calculateUpperTotal(0);

    const p2Upper =
        calculateUpperTotal(1);

    const bonusRow =
        document.getElementById(
            "bonusRow"
        );

    const bonusScoreP1 =
        document.getElementById(
            "bonusScoreP1"
        );

    const bonusScoreP2 =
        document.getElementById(
            "bonusScoreP2"
        );

    bonusScoreP1.textContent =
        p1Upper;

    bonusScoreP2.textContent =
        p2Upper;

    if (p1Upper >= 63) {

        bonusScoreP1.classList.add(
            "bonus-active"
        );

        if (!bonusUnlockedP1) {

            bonusUnlockedP1 = true;

            bonusRow.classList.add(
                "flash"
            );

            setTimeout(() => {

                bonusRow.classList.remove(
                    "flash"
                );

            }, 600);
        }

    } else {

        bonusScoreP1.classList.remove(
            "bonus-active"
        );
    }
    if (p2Upper >= 63) {

        bonusScoreP2.classList.add(
            "bonus-active"
        );

        if (!bonusUnlockedP2) {

            bonusUnlockedP2 = true;

            bonusRow.classList.add(
                "flash"
            );

            setTimeout(() => {

                bonusRow.classList.remove(
                    "flash"
                );

            }, 600);
        }

    } else {

        bonusScoreP2.classList.remove(
            "bonus-active"
        );
    }
}

/* =====================================
   GAME END
===================================== */

function checkGameEnd() {
    console.log(
        "P1",
        Object.values(game.scores[0])
            .filter(v => v !== null)
            .length
    );

    console.log(
        "P2",
        Object.values(game.scores[1])
            .filter(v => v !== null)
            .length
    );
    const player1Filled =
        Object.values(
            game.scores[0]
        )
            .filter(
                v => v !== null
            )
            .length;

    const player2Filled =
        Object.values(
            game.scores[1]
        )
            .filter(
                v => v !== null
            )
            .length;

    if (game.mode === 1) {

        if (
            player1Filled <
            TOTAL_CATEGORIES
        )
            return;

    } else {

        if (
            player1Filled <
            TOTAL_CATEGORIES ||
            player2Filled <
            TOTAL_CATEGORIES
        )
            return;
    }

    endGame();
}


function endGame() {

    playSound(winSound);

    const scoreP1 =
        calculateTotalScore(0);

    const scoreP2 =
        calculateTotalScore(1);

    let winner;

    if (game.mode === 1) {

        winner =
            game.playerNames[0];

    } else {

        if (scoreP1 > scoreP2) {

            winner =
                game.playerNames[0];

        } else if (scoreP2 > scoreP1) {

            winner =
                game.playerNames[1];

        } else {

            winner =
                "Pareggio";
        }
    }

    updateStatistics();
    document.getElementById(
        "finalPlayer1Name"
    ).textContent =
        game.playerNames[0];

    document.getElementById(
        "finalPlayer2Name"
    ).textContent =
        game.playerNames[1];

    document.getElementById(
        "winnerName"
    ).textContent =
        winner;

    document.getElementById(
        "finalScoreP1"
    ).textContent =
        scoreP1;

    document.getElementById(
        "finalScoreP2"
    ).textContent =
        scoreP2;

    document.getElementById(
        "gameOverModal"
    ).classList.add("show");

    localStorage.removeItem(
        "yahtzee-save"
    );
}

/* =====================================
   BEST CATEGORY
===================================== */

function getBestCategory() {

    let bestName = "-";
    let bestScore = -1;

    Object.entries(game.scores)
        .forEach(([name, value]) => {

            if (value > bestScore) {

                bestScore = value;
                bestName = name;
            }

        });

    return bestName;
}

/* =====================================
   NEW GAME
===================================== */

document
    .getElementById("newGameBtn")
    .addEventListener(
        "click",
        newGame
    );

document
    .getElementById("newGameButton")
    .addEventListener(
        "click",
        newGame
);
document
    .getElementById("newStat")
    .addEventListener(
        "click",
        cancelStats
    );

function newGame() {

    localStorage.removeItem(
        "yahtzee-save"
    );

    location.reload();
}
function cancelStats() {

    localStorage.removeItem(
        "yahtzee-stats"
    );

    location.reload();
}
function startNewGame() {

    if (
        !confirm(
            "Vuoi iniziare una nuova partita?"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        "yahtzee-save"
    );

    game.dice =
        [1, 1, 1, 1, 1];

    game.locked =
        [false, false, false, false, false];

    game.rollsLeft = 3;

    game.turn = 1;

    game.scores = {

        ones: null,
        twos: null,
        threes: null,
        fours: null,
        fives: null,
        sixes: null,

        threeKind: null,
        fourKind: null,
        fullHouse: null,
        smallStraight: null,
        largeStraight: null,
        yahtzee: null,
        chance: null
    };

    bonusUnlockedP1 = false;
    bonusUnlockedP2 = false;

    document
        .querySelectorAll(".category-row")
        .forEach(row => {

            row.classList.remove(
                "used",
                "flash"
            );

            row.querySelector(
                ".score-cell"
            ).textContent = "";

            row.querySelector(
                ".preview-cell"
            ).textContent = "";
        });

    document
        .getElementById("bonusRow")
        .classList.remove(
            "bonus-earned",
            "flash"
        );

    updateDiceUI();

    updateHeader();

    updateBonusUI();

    updatePreviews();

    saveGame();
}
/* =====================================
   LOCAL STORAGE SAVE
===================================== */

function saveGame() {

    const data = {

        mode:
            game.mode,

        playerNames:
            game.playerNames,

        currentPlayer:
            game.currentPlayer,

        dice:
            game.dice,

        locked:
            game.locked,

        rollsLeft:
            game.rollsLeft,

        turn:
            game.turn,

        scores:
            game.scores
    };

    localStorage.setItem(
        "yahtzee-save",
        JSON.stringify(data)
    );
}
/* =====================================
   LOAD GAME
===================================== */

function loadGame() {

    const save =
        localStorage.getItem(
            "yahtzee-save"
        );

    if (!save)
        return;

    const data =
        JSON.parse(save);

    game.mode =
        data.mode ?? 1;

    game.playerNames =
        data.playerNames ??
        ["Giocatore 1", "Giocatore 2"];

    game.currentPlayer =
        data.currentPlayer ?? 0;

    game.dice =
        data.dice;

    game.locked =
        data.locked;

    game.rollsLeft =
        data.rollsLeft;

    game.turn =
        data.turn;

    game.scores =
        data.scores;

    restoreBoard();
}

/* =====================================
   RESTORE BOARD
===================================== */

function restoreBoard() {

    document
        .querySelectorAll(".category-row")
        .forEach(row => {

            const category =
                row.dataset.category;

            const p1Score =
                game.scores[0][category];

            const p2Score =
                game.scores[1][category];

            if (p1Score !== null) {

                row.querySelector(
                    ".score-cell-p1"
                ).textContent =
                    p1Score;
            }

            if (p2Score !== null) {

                row.querySelector(
                    ".score-cell-p2"
                ).textContent =
                    p2Score;
            }
        });

    updatePlayerHeaders();
}

/* =====================================
   STATISTICS
===================================== */

function getStats() {

    return JSON.parse(

        localStorage.getItem(
            "yahtzee-stats"
        )

    ) || {

        gamesPlayed: 0,
        bestScore: 0,
        totalScore: 0,
        yahtzeeCount: 0

    };
}

function updateStatistics() {

    const stats =
        getStats();

    const scoreP1 =
        calculateTotalScore(0);

    const scoreP2 =
        calculateTotalScore(1);

    const score =
        Math.max(
            scoreP1,
            scoreP2
        );

    stats.gamesPlayed++;

    stats.totalScore += score;

    stats.bestScore =
        Math.max(
            stats.bestScore,
            score
        );

    localStorage.setItem(
        "yahtzee-stats",
        JSON.stringify(stats)
    );

    loadStatistics();
}

function loadStatistics() {

    const stats =
        getStats();

    document.getElementById(
        "gamesPlayed"
    ).textContent =
        stats.gamesPlayed;

    document.getElementById(
        "bestScore"
    ).textContent =
        stats.bestScore;

    document.getElementById(
        "averageScore"
    ).textContent =
        stats.gamesPlayed
            ? Math.round(
                stats.totalScore /
                stats.gamesPlayed
            )
            : 0;

    document.getElementById(
        "yahtzeeCount"
    ).textContent =
        stats.yahtzeeCount;
}

function increaseYahtzeeCount() {

    const stats =
        getStats();

    stats.yahtzeeCount++;

    localStorage.setItem(
        "yahtzee-stats",
        JSON.stringify(stats)
    );

    loadStatistics();
}

/* =====================================
   AUDIO
===================================== */

function playSound(sound) {

    if (!sound)
        return;

    sound.currentTime = 0;

    sound.play().catch(() => { });
}

/* =====================================
   STARTUP
===================================== */

loadStatistics();

updateBonusUI();

updateHeader();

updatePreviews();

saveGame();