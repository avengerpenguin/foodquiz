import { default as autoComplete } from "@tarekraafat/autocomplete.js";
require("@tarekraafat/autocomplete.js/dist/css/autoComplete.02.css");
const md5 = require("js-md5");

const now = new Date();
const today =
  now.getUTCFullYear() +
  "-" +
  (now.getUTCMonth() + 1) +
  "-" +
  now.getUTCDate() +
  "T" +
  now.getUTCHours() +
  ":" +
  now.getUTCMinutes();

const corpus = await require("./foods.json");
const labels = Object.keys(corpus);

const answer =
  labels[parseInt(md5(today).substring(0, 10), 16) % labels.length];
const possibleHints = corpus[answer].ingredients;
const hint = possibleHints[parseInt(md5(today), 16) % possibleHints.length];

document.getElementsByTagName("main")[0].innerHTML = `
  <p>Hint: ${hint}</p>
  <div id="result"></div>
  <input id="autoComplete" />
  <ul id="guesses"></ul>
`;

function highlight(guessInfo, answerInfo) {
  if (Array.isArray(answerInfo)) {
    return `<span class="${
      answerInfo.includes(guessInfo) ? "right" : "wrong"
    }">${guessInfo}</span>`;
  } else {
    return `<span class="${
      guessInfo === answerInfo ? "right" : "wrong"
    }">${guessInfo}</span>`;
  }
}

function renderGuess(corpus, selection, answer) {
  return `
        <h2>${highlight(selection, answer)}</h2>
        <p>From: ${corpus[selection].origins
          .map((x) => {
            return highlight(x, corpus[answer].origins);
          })
          .join(", ")}</p>
        <p>Contains: ${corpus[selection].ingredients
          .map((x) => {
            return highlight(x, corpus[answer].ingredients);
          })
          .join(", ")}</p>
    `;
}

const config = {
  placeHolder: "Guess a Film...",
  data: {
    src: labels,
  },
  resultItem: {
    highlight: true,
  },
  events: {
    input: {
      selection: (event) => {
        const selection = event.detail.selection.value;
        if (selection === answer) {
          document.getElementById("result").innerHTML =
            `<p class="right">${selection} is correct!</p>`;
        } else {
          document.getElementById("result").innerHTML =
            `<p class="wrong">Not ${selection}!</p>`;
        }

        const guess = document.createElement("li");
        guess.innerHTML = renderGuess(corpus, selection, answer);
        document
          .getElementById("guesses")
          .insertBefore(guess, document.getElementById("guesses").firstChild);

        // Disallow guessing this again
        autoCompleteJS.data.src = autoCompleteJS.data.src.filter(
          (x) => x !== selection,
        );

        // Return focus back to guess box for quick feedback loops
        autoCompleteJS.input.value = "";
        autoCompleteJS.input.focus();
      },
    },
  },
};

const autoCompleteJS = new autoComplete(config);
autoCompleteJS.input.focus();
