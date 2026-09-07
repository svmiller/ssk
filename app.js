let vocabulary = [];

let deck = [];
let currentIndex = 0;

let score = 0;
let streak = 0;

let currentCard = null;
let answerRevealed = false;


/* --------------------------------
   Load vocabulary
-------------------------------- */

async function loadVocabulary() {

    try {

        const response = await fetch("vocabulary.json");

        if (!response.ok) {
            throw new Error("Could not load vocabulary.json");
        }

        vocabulary = await response.json();

        startGame();

    } catch (error) {

        console.error(error);

        document.getElementById("prompt").textContent =
            "Could not load vocabulary.";

    }
}


/* --------------------------------
   Start / reset game
-------------------------------- */

function startGame() {

    score = 0;
    streak = 0;
    currentIndex = 0;

    createDeck();

    updateStats();
    showCard();
}


/* --------------------------------
   Create randomized deck
-------------------------------- */

function createDeck() {

    const limit = document.getElementById("cardLimit").value;

    deck = [...vocabulary];

    shuffle(deck);

    if (limit !== "all") {
        deck = deck.slice(0, Number(limit));
    }

}


/* --------------------------------
   Fisher-Yates shuffle
-------------------------------- */

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] =
            [array[j], array[i]];
    }

}


/* --------------------------------
   Show current card
-------------------------------- */

function showCard() {

    if (currentIndex >= deck.length) {

        showGameFinished();

        return;
    }

    currentCard = deck[currentIndex];

    answerRevealed = false;

    const direction =
        document.getElementById("direction").value;

    const prompt = document.getElementById("prompt");

    if (direction === "korean-to-english") {

        prompt.textContent = currentCard.korean;

    } else {

        prompt.textContent = currentCard.english;

    }

    document.getElementById("answerInput").value = "";

    document.getElementById("result").className =
        "result hidden";

    document.getElementById("result").innerHTML = "";

    document.getElementById("selfAssessment")
        .classList.add("hidden");

    document.getElementById("nextButton")
        .classList.add("hidden");

    document.getElementById("revealButton")
        .classList.remove("hidden");

    document.getElementById("checkButton")
        .classList.remove("hidden");

    document.getElementById("answerInput")
        .classList.remove("hidden");

    document.getElementById("answerInput")
        .focus();

    updateStats();

}


/* --------------------------------
   Get correct answer
-------------------------------- */

function getCorrectAnswer() {

    const direction =
        document.getElementById("direction").value;

    if (direction === "korean-to-english") {

        return currentCard.english;

    } else {

        return currentCard.korean;

    }

}


/* --------------------------------
   Check typed answer
-------------------------------- */

function checkAnswer() {

    if (answerRevealed) {
        return;
    }

    const input =
        document.getElementById("answerInput")
            .value
            .trim()
            .toLowerCase();

    if (!input) {
        return;
    }

    const correctAnswer =
        getCorrectAnswer()
            .toLowerCase();

    const result =
        document.getElementById("result");

    if (input === correctAnswer) {

        result.innerHTML = `
            <strong>Correct!</strong>
        `;

        result.className =
            "result correct-result";

        document.getElementById("selfAssessment")
            .classList.remove("hidden");

        score++;
        streak++;

    } else {

        result.innerHTML = `
            <strong>Not quite.</strong>
            <div class="correct-answer">
                ${getCorrectAnswer()}
            </div>
        `;

        result.className =
            "result incorrect-result";

        document.getElementById("selfAssessment")
            .classList.remove("hidden");

        streak = 0;
    }

    answerRevealed = true;

    document.getElementById("checkButton")
        .classList.add("hidden");

    document.getElementById("revealButton")
        .classList.add("hidden");

    updateStats();
    saveProgress();

}


/* --------------------------------
   Reveal answer
-------------------------------- */

function revealAnswer() {

    if (answerRevealed) {
        return;
    }

    const result =
        document.getElementById("result");

    result.innerHTML = `
        <div>The answer is:</div>
        <div class="correct-answer">
            ${getCorrectAnswer()}
        </div>
    `;

    result.className =
        "result";

    document.getElementById("selfAssessment")
        .classList.remove("hidden");

    document.getElementById("checkButton")
        .classList.add("hidden");

    document.getElementById("revealButton")
        .classList.add("hidden");

    answerRevealed = true;

    streak = 0;

    updateStats();
    saveProgress();

}


/* --------------------------------
   Next card
-------------------------------- */

function nextCard() {

    currentIndex++;

    showCard();

}


/* --------------------------------
   Finished game
-------------------------------- */

function showGameFinished() {

    document.getElementById("prompt")
        .textContent = "잘했어요!";

    document.getElementById("answerArea")
        .classList.add("hidden");

    document.getElementById("result")
        .className = "result";

    document.getElementById("result")
        .innerHTML = `
            <strong>Finished!</strong>
            <br><br>
            Score: ${score} / ${deck.length}
        `;

    document.getElementById("selfAssessment")
        .classList.add("hidden");

    document.getElementById("revealButton")
        .classList.add("hidden");

    document.getElementById("nextButton")
        .classList.add("hidden");

}


/* --------------------------------
   Statistics
-------------------------------- */

function updateStats() {

    const total =
        Math.max(deck.length, 1);

    document.getElementById("cardNumber")
        .textContent =
        `${Math.min(currentIndex + 1, total)} / ${total}`;

    document.getElementById("score")
        .textContent = score;

    document.getElementById("streak")
        .textContent = streak;

    const percentage =
        (currentIndex / total) * 100;

    document.getElementById("progressBar")
        .style.width =
        `${percentage}%`;

}


/* --------------------------------
   Save progress
-------------------------------- */

function saveProgress() {

    const progress = {

        score: score,
        streak: streak,

        lastDirection:
            document.getElementById("direction").value

    };

    localStorage.setItem(
        "koreanFlashcardProgress",
        JSON.stringify(progress)
    );

}


/* --------------------------------
   Reset saved progress
-------------------------------- */

function resetProgress() {

    const confirmed =
        confirm(
            "Are you sure you want to reset your progress?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(
        "koreanFlashcardProgress"
    );

    startGame();

}


/* --------------------------------
   Event listeners
-------------------------------- */

document
    .getElementById("checkButton")
    .addEventListener(
        "click",
        checkAnswer
    );

document
    .getElementById("revealButton")
    .addEventListener(
        "click",
        revealAnswer
    );

document
    .getElementById("nextButton")
    .addEventListener(
        "click",
        nextCard
    );

document
    .getElementById("correctButton")
    .addEventListener(
        "click",
        nextCard
    );

document
    .getElementById("incorrectButton")
    .addEventListener(
        "click",
        nextCard
    );

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        resetProgress
    );


/* Start a new deck when settings change */

document
    .getElementById("direction")
    .addEventListener(
        "change",
        startGame
    );

document
    .getElementById("cardLimit")
    .addEventListener(
        "change",
        startGame
    );


/* Keyboard shortcuts */

document.addEventListener(
    "keydown",
    function(event) {

        // Enter = check answer
        if (
            event.key === "Enter" &&
            !answerRevealed
        ) {
            checkAnswer();
        }

        // Space = reveal
        if (
            event.key === " " &&
            !answerRevealed
        ) {

            // Don't insert a space into the input
            if (
                document.activeElement.tagName === "INPUT"
            ) {
                return;
            }

            event.preventDefault();

            revealAnswer();
        }

        // Right arrow = next
        if (
            event.key === "ArrowRight" &&
            answerRevealed
        ) {
            nextCard();
        }

    }
);


/* --------------------------------
   Begin
-------------------------------- */

loadVocabulary();
