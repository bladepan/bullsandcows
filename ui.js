class UiManager {
    constructor() {
        this.outputEle = document.getElementById('output');
        this.timerEle = document.getElementById('timerOutput');
        this.guessInputEle = document.getElementById('guessInput');
        this.echoEle = document.getElementById('feedbackOutput');
    }

    getGameMode() {
        const gameModeInputs = document.getElementsByName("gameMode");
        let mode = 'default';
        for (let i = 0; i < gameModeInputs.length; i++) {
            const gameModeInput = gameModeInputs[i];
            if (gameModeInput.checked) {
                mode = gameModeInput.value;
                break;
            }
        }
        return mode;
    }

    startGame() {
        console.log('start game');
        if (!this.gameHost) {
            this.gameSettings = new GameSettings(0, 10, 4);
            this.gameHost = new GameHost(this.gameSettings);
        } else {
            // reset the secret
            this.gameHost.generateSecret();
        }

        this.answers = [];
        this.outputEle.innerHTML = '';
        this.started = true;
        this.echo("Game started.")
        this.startTimer();
    }

    startTimer() {
        console.log('start timer');
        this.timerEle.innerHTML = '';
        this.stopTimer();
        this.gameStartTime = Date.now();
        this.intervalHandle = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    echo(str) {
        this.echoEle.innerText = str;
    }

    updateTimer() {
        const now = Date.now();
        this.timerEle.innerText = (now - this.gameStartTime) + "ms";
    }

    submitGuess() {
        if (!this.started) {
            this.echo("click start game to start the game");
            return;
        }
        let inputStr = this.guessInputEle.value;
        if (!inputStr) {
            this.echo("please input a 4 digit number");
            return;
        }
        inputStr = inputStr.trim();
        if (inputStr.length !== 4) {
            this.echo('invalid input "' + inputStr + '".');
            return;
        }
        const numArray = [];
        for (let i = 0; i < inputStr.length; i++) {
            numArray.push(parseInt(inputStr[i]));
        }
        const validateResult = this.gameHost.validate(numArray);
        if (!validateResult.result) {
            this.echo(validateResult.reason);
            return;
        }
        const answer = this.gameHost.getResult(numArray);
        if (answer.completed) {
            this.stopTimer();
            this.updateTimer();
        }
        this.displayAnswer(numArray, answer);
    }

    showAnswer() {
        if (!this.started) {
            this.echo("start the game first.");
            return;
        }

        const secret = this.gameHost.secret;
        const secretStr = JSON.stringify(secret);
        this.displayAnswerStr('The answer is ' + secretStr);
        this.botPlay();
    }

    botPlay() {
        if (!this.botPlayer) {
            this.botPlayer = new PermutationPlayer(this.gameSettings);
        }

        this.botPlayer.beforeGame();
        for (let i = 0; i < 16; i++) {
            const result = this.botPlayer.play();
            if (result.isFailure()) {
                this.displayAnswerStr('bot failed ' + result.reason);
                break;
            }
            const answer = this.gameHost.getResult(result.answer);

            this.displayAnswerStr(`bot guess ${i + 1}: ${JSON.stringify(result.answer)}, answer ${this.renderAnswer(answer)}.`);
            if (answer.completed) {
                break;
            }
            this.botPlayer.feedback(answer);
        }
    }

    renderAnswer(answer) {
        const gameMode = this.getGameMode();
        let str = '';
        if (gameMode === 'default') {
            str += answer.bulls + ' ' + 'bull';
            if (answer.bulls !== 1) {
                str += 's';
            }
            str += ', ' + answer.cows + ' ' + 'cow';
            if (answer.cows !== 1) {
                str += 's';
            }
        } else {
            str += answer.bulls + 'A' + answer.cows + 'B';
        }
        return str;
    }

    displayAnswer(guess, answer) {
        this.answers.push(answer);
        const str = `Guess ${this.answers.length}: ${JSON.stringify(guess)}, answer ${this.renderAnswer(answer)}`;
        this.displayAnswerStr(str);
        if (answer.completed) {
            this.displayAnswerStr('You win!')
            this.showAnswer();
        }
    }

    displayAnswerStr(str) {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'columns message-body';
        answerDiv.innerText = str;
        this.outputEle.appendChild(answerDiv);
    }
}


const manager = new UiManager();

function startGame() {
    manager.startGame();
}

function submitGuess() {
    manager.submitGuess();
}

function showAnswer() {
    manager.showAnswer();
}