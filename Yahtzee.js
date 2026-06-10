/* =====================================
   YAHTZEE PROFESSIONAL
   SCRIPT.JS
===================================== */

const TOTAL_CATEGORIES = 13;
let bonusUnlocked = false;
/* =====================================
   STATE
===================================== */

const game = {

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

    scores: {

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
    }
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

function init() {

    loadGame();

    bindDice();

    bindCategories();

    updateDiceUI();

    updatePreviews();

    updateHeader();
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

function calculateUpperTotal() {

    return (

        (game.scores.ones || 0) +
        (game.scores.twos || 0) +
        (game.scores.threes || 0) +
        (game.scores.fours || 0) +
        (game.scores.fives || 0) +
        (game.scores.sixes || 0)

    );
}

function calculateBonus() {

    return calculateUpperTotal()
        >= 63
        ? 35
        : 0;
}

/* =====================================
   TOTAL SCORE
===================================== */

function calculateTotalScore() {

    let total = 0;

    Object.values(game.scores)
        .forEach(score => {

            if (score !== null)
                total += score;

        });

    total += calculateBonus();

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

    document
        .querySelectorAll(".category-row")
        .forEach(row => {

            const category =
                row.dataset.category;

            const preview =
                row.querySelector(".preview-cell");

            if (game.scores[category] !== null) {

                preview.textContent = "";
                return;
            }

            const score =
                getCategoryScore(category);

            preview.textContent = score;

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

    if (game.scores[category] !== null)
        return;

    const score =
        getCategoryScore(category);

    game.scores[category] =
        score;

    const scoreCell =
        row.querySelector(".score-cell");

    scoreCell.textContent =
        score;

    row.classList.add(
        "used",
        "flash"
    );

    playSound(scoreSound);

    if (
        category === "yahtzee" &&
        score === 50
    ) {
        increaseYahtzeeCount();
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

    game.locked =
        [false, false, false, false, false];

    updateDiceUI();
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
        calculateTotalScore();

    rollButton.disabled =
        game.rollsLeft <= 0;
}

/* =====================================
   TOTAL ANIMATION
===================================== */

function animateTotal() {

    const target =
        calculateTotalScore();

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

    const upperTotal =
        calculateUpperTotal();

    const bonusRow =
        document.getElementById("bonusRow");

    document.getElementById(
        "bonusScore"
    ).textContent = upperTotal;

    if (upperTotal >= 63) {

        bonusRow.classList.add(
            "bonus-earned"
        );

        if (!bonusUnlocked) {

            bonusUnlocked = true;

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

        bonusRow.classList.remove(
            "bonus-earned"
        );
    }
}
/* =====================================
   GAME END
===================================== */

function checkGameEnd() {

    const filled =
        Object.values(game.scores)
            .filter(v => v !== null)
            .length;

    if (filled < TOTAL_CATEGORIES)
        return;

    endGame();
}

function endGame() {

    playSound(winSound);

    updateStatistics();

    const modal =
        document.getElementById(
            "gameOverModal"
        );

    modal.classList.add("show");

    document.getElementById(
        "finalScore"
    ).textContent =
        calculateTotalScore();

    document.getElementById(
        "finalBonus"
    ).textContent =
        calculateBonus();

    document.getElementById(
        "bestCategory"
    ).textContent =
        getBestCategory();

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

    bonusUnlocked = false;

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
}/* =====================================
   LOCAL STORAGE SAVE
===================================== */

function saveGame() {

    const data = {

        dice: game.dice,
        locked: game.locked,
        rollsLeft: game.rollsLeft,
        turn: game.turn,
        scores: game.scores

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

            const score =
                game.scores[category];

            if (score === null)
                return;

            row.classList.add("used");

            row.querySelector(
                ".score-cell"
            ).textContent = score;
        });
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

    const score =
        calculateTotalScore();

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