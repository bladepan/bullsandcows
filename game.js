class GameSettings {
    constructor(min, max, len){
        this.min = min;
        this.max = max;
        this.len = len;
    }
}


class ValidateResult {
    constructor(result, reason) {
        this.result = result;
        this.reason = reason;
    }
}

class GuessResult {
    constructor(bulls, cows, completed) {
        this.bulls = bulls;
        this.cows = cows;
        this.completed = completed;
    }

    equals(another) {
        return this.bulls === another.bulls && this.cows === another.cows;
    }
}

class GameHost {
    constructor(gameSettings, secret) {
        if(gameSettings) {
            this.settings = gameSettings;
        } else {
            this.settings = new GameSettings(0, 10, 4);
        }
        
        if (secret) {
            this.secret = secret;
        } else {
            this.generateSecret();
        }

        this.gameLogic = new GameLogic();
    }

    generateSecret() {
        this.secret = [];
        const numberCount = this.settings.max - this.settings.min;
        if(numberCount < this.settings.len) {
            throw "invalid settings";
        }
        
        while(this.secret.length < this.settings.len) {
            const num = this.settings.min + Math.floor(Math.random() * numberCount);
            if(this.secret.indexOf(num) < 0) {
                this.secret.push(num);
            }
        }
    }

    validate(arr) {
        if (!arr || arr.length !== this.settings.len) {
            return new ValidateResult(false, "invalid arr length");
        }
        for (let i = 0; i < arr.length; i++) {
            const num = arr[i];
            if (typeof num !== "number") {
                return new ValidateResult(false, "invalid array element type");
            }
            if (num < this.settings.min || num >= this.settings.max) {
                return new ValidateResult(false, "element out of bounds");
            }

            if(arr.indexOf(num) !== i) {
                return new ValidateResult(false, "duplicate element found");
            }
        }
        return new ValidateResult(true);
    }

    getResult(arr) {
        const validateResult = this.validate(arr);
        if (!validateResult.result) {
            throw validateResult;
        }

        return this.gameLogic.getResult(this.secret, arr);
    }
}

class GameLogic {
    constructor(){}

    getResult(secret, answer) {
        let bulls = 0;
        let cows = 0;
        for (let i = 0; i < secret.length; i++) {
            const num = secret[i];
            const guessedNum = answer[i];
            if (num === guessedNum) {
                bulls++;
            } else {
                if (secret.indexOf(guessedNum) >= 0) {
                    cows++;
                }
            }
        }
        return new GuessResult(bulls, cows, bulls === secret.length);
    }
}

class PlayerResult {
    constructor(status, answer, reason) {
        // 0 success, 1 failure
        this.status = status;
        this.answer = answer;
        this.reason = reason;
    }

    isFailure() {
        return this.status !== 0;
    }
}

/**
 *  bot player that keeps a list of all possible
 *  targets at the current stage of the game
 */
class PermutationPlayer {
    constructor(gameSettings) {
        this.gameSettings = gameSettings;
        this.gameLogic = new GameLogic();

        // generage all possible targets
        this.generateAllAnswers(gameSettings.min, gameSettings.max, gameSettings.len);
    }

    generateAllAnswers(min, max, len) {
        const numbers = [];
        for (let i = min; i < max; i++) {
            numbers.push({
                taken: false,
                val: i
            });
        }
        const buffer = [];
        for (let i = 0; i < len; i++) {
            buffer.push(0);
        }
        const result = [];
        this.permuate(numbers, buffer, 0, result);
        this.allAnswers = result;
    }

    permuate(numbers, buffer, bufferIndex, collector) {
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            if (!number.taken) {
                buffer[bufferIndex] = number.val;
                number.taken = true;

                if (bufferIndex == buffer.length - 1) {
                    // we got a result, clone it
                    collector.push(this.cloneArray(buffer));
                } else {
                    this.permuate(numbers, buffer, bufferIndex + 1, collector);
                }
                number.taken = false;
            }
        }
    }

    cloneArray(arr) {
        const result = [];
        arr.forEach(i => {
            result.push(i);
        });
        return result;
    }

    beforeGame() {
        this.candidates = this.cloneArray(this.allAnswers);
    }

    play() {
        if(this.candidates.length === 0) {
            return new PlayerResult(1, [], "no answer found");
        }

        // choose the first possible target.
        this.answer = this.candidates[0];
        return new PlayerResult(0, this.answer);
    }

    feedback(guessResult) {
        if(guessResult.completed) {
            return;
        }

        // eliminate impossible targets given the answer
        const remaining = [];
        for (let i = 0; i < this.candidates.length; i++) {
            const candidate = this.candidates[i];
            const expectedResult = this.gameLogic.getResult(candidate, this.answer);
            if(expectedResult.equals(guessResult)) {
                remaining.push(candidate);
            }
        }
        this.candidates = remaining;
    }
}


function playWithPermuation() {
    const gameHost = new GameHost();
    const player = new PermutationPlayer(gameHost.settings);

    for (let rounds = 0; rounds < 100; rounds++) {
        console.log("round " + rounds);
        gameHost.generateSecret();
        console.log(JSON.stringify(gameHost.secret));
        player.beforeGame();
        for (let i = 0; i < 10; i++) {
            const result = player.play();
            console.log(JSON.stringify(result));
            if(result.isFailure()) {
                console.log("failed " + i);
                break;
            }
            const playResult = gameHost.getResult(result.answer);
            console.log(JSON.stringify(playResult));
            if(playResult.completed) {
                console.log("completed " + i);
                break;
            }
            player.feedback(playResult);
        }
    }
    
}

