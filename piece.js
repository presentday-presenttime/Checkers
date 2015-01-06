/**
 * A individual Checker, owned by a team, moved on the board.
 * The piece is knows it's history of moves, and is given a score based on it's performance
 * This score is what's used to detimine parents in future generations.
 * @param {int} id     a unique id for the piece, so they can be sorted later
 * @param {int} team   the team the piece belongs to.
 * @param {int} xCoord
 * @param {int} yCoord
 */
function Piece(id, team, xCoord, yCoord) {

    this.id = id; //so we can ensure the parents are fromt he same piece
    this.team = team;
    this.direction = (this.team) ? -1 : 1;
    this.x = xCoord;
    this.y = yCoord;
    this.isKing = false;
    this.isDead = false;

    this.genetic = false;
    this.mutationRate = 0.00; //1%
    this.moveList = []; // = this.moveRandom(game);
    this.moveCount = 0;

    this.killCount = 0;
    this.score = 0; //win > # of kills > isDead > isKing > how long it lasted
    this.parentA;
    this.parentB;
    this.currentParent; //either parentA or B

    this.random = function(min, max) {
        max = max || 1;
        min = min || 0;
        if(this.genetic === true){
            return min + Math.random() * (max - min);
        }
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280;
        return min + rnd * (max - min);
    };


    this.shuffle = function(array) {

        var temp, randomIndex;

        // for (var currentIndex = array.length - 1; currentIndex >= 0; currentIndex--) {
        //     randomIndex = Math.floor(random(0, 1) * currentIndex);
        //     temp = array[currentIndex];
        //     array[currentIndex] = array[randomIndex];
        //     array[randomIndex] = temp;
        // }

        for (var i = array.length - 1; i >= 0; i--) {
            randomIndex = Math.floor(this.random(0, i+1));
            temp = array[i];
            array[i] = array[randomIndex];
            array[randomIndex] = temp;
        }

        return array;
    };

    this.switchParents = function() {
        this.currentParent = (this.currentParent === this.parentA) ? this.parentB : this.parentA;

        return this.currentParent;
    };

    this.checkMutation = function() {
        if (Math.random() < this.mutationRate) {
            return true;
        }

        return false;
    };

    this.generateScore = function(isWinner) {
        this.score = 0;

        //value = (value of lower tier)*2 + 1
        if (isWinner === true) {
            this.score += 17;
        }

        this.score += this.killCount / (1.5) * 4; //2 kills is > 1 death, but a win is greater than (3) kills?

        if (!this.isDead) {
            this.score += 3;
        }

        if (this.isKing) {
            this.score += 1;
        }

        //not sure if I want to implement this
        //this.score += 60/(this.moveCount+1);

        if (this.score > 53) {
            console.log(this.score);
            console.log(isWinner);
            console.log(this.killCount);
            console.log(this.isDead);
            console.log(this.isKing);
            this.score = -100000000;
        }

        // this.score *= -1;

        return this.score;
    };

    this.moveRandom = function() {
        if (this.isDead) {
            return undefined;
        }
        if (this.moveCount >= 1000) {
            return undefined;
        }
        if (this.genetic && this.currentParent !== undefined) {
            // debug("I am genetic & I am moving randomly!");
        }

        //get a list of possible moves
        var choices = this.getAvailableMoves();

        //pick one randomly
        choices = this.shuffle(choices);
        if (this.random(0, 1) < 0.5) { //if there is only 2 options, I think shuffle always swaps them.
            choices = this.shuffle(choices);
        }

        if (choices[0] === undefined) {
            return undefined;
        }

        var savedX = this.x;
        var savedY = this.y;
        if (game.move(this, choices[0].x, choices[0].y)) { //if we've found a valid move
            this.moveList[this.moveCount] = { //add it to the movelist
                piece: this,
                savedX: savedX,
                savedY: savedY,
                x: choices[0].x,
                y: choices[0].y
            };
            this.moveCount++;
            return this.moveList[this.moveCount - 1]; //and return it.
        }

        return undefined;
    };

    this.move = function(x, y) {
        if (this.isDead) { //dead things can't move
            return undefined;
        }
        if (this.moveCount >= 1000) { //prevent infinite loops (may want to lower the limit)
            return undefined;
        }

        if (x && y) {
            //if given x, y try to move to them
            if (game.move(this, x, y)) {
                this.moveCount++;
                return this.moveList[this.moveCount - 1];
            }
            //if unable, return undefined
            if (!this.moveList[this.moveCount]) {
                return undefined;
            }
        } else if (this.genetic && this.currentParent) {
            // debug(this, "I am piece #" + this.id + ", I am genetic, and am currently at ["
                // + this.x + ", " + this.y + "].");

            //mutation
            if (this.checkMutation() === true) {
                return this.moveRandom();
            }

            //if we are genetic & have parents, follow their dna
            //try currentParent
            this.moveList[this.moveCount] = this.currentParent.moveList[this.moveCount];
            if (this.moveList[this.moveCount]) { //if we have a move
                // debug(this, "I have am trying to move to [" + this.moveList[this.moveCount].x + ", " + this.moveList[this.moveCount].y + "], because parent: " + ((this.currentParent === this.parentA) ? "A" : "B") + " wanted me to move there!");
                if (game.move(this, this.moveList[this.moveCount].x, this.moveList[this.moveCount].y)) { //try it
                    // debug(this, "I moved succesfully, I am now at [" + this.x + ", " + this.y + "].");
                    this.moveCount++;
                    return this.moveList[this.moveCount - 1];
                }
            }

            //next try other parent
            if (!this.moveList[this.moveCount]) {
                // debug(this, "My attempt didn't work so I am switching Parents!");
                this.switchParents();
                this.moveList[this.moveCount] = this.currentParent.moveList[this.moveCount];

                if (this.moveList[this.moveCount]) { //if we have a move
                    // debug(this, "I have am trying to move to [" + this.moveList[this.moveCount].x + ", " + this.moveList[this.moveCount].y + "], because parent: " + ((this.currentParent === this.parentA) ? "A" : "B") + " wanted me to move there!");
                    if (game.move(this, this.moveList[this.moveCount].x, this.moveList[this.moveCount].y)) { //try it
                        // debug(this, "I moved succesfully, I am not at [" + this.x + ", " + this.y + "].");
                        this.moveCount++;
                        return this.moveList[this.moveCount - 1];
                    }
                }
            }

            // debug(this, "I wasn't able to find a valid move. I am at [" + this.x + ", " + this.y + "].");
            return undefined;
        }

        return undefined;
    };

    this.getAvailableMoves = function() {
        if (this.isDead)
            return undefined;
        var arr = [];
        var y, x;
        var d = this.direction;

        //check moving forward
        y = this.y + d;
        x = this.x + 1;
        if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
            // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
            arr.push({
                x: x,
                y: y
            });
        }

        y = this.y + d;
        x = this.x - 1;
        if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
            // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
            arr.push({
                x: x,
                y: y
            });
        }

        //check jumping
        y = this.y + d;
        x = this.x + 1;
        if (board.pieceAt(y, x)) {
            if (board.pieceAt(y, x)
                .team !== this.team) {
                y += d;
                x++;

                if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                    // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                    arr.push({
                        x: x,
                        y: y,
                        jump: true
                    });
                }
            }
        }

        y = this.y + d;
        x = this.x - 1;
        if (board.pieceAt(y, x)) {
            if (board.pieceAt(y, x)
                .team !== this.team) {
                y += d;
                x--;

                if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                    // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                    arr.push({
                        x: x,
                        y: y,
                        jump: true
                    });
                }
            }
        }

        //check moving backwards
        if (this.isKing) {
            //check moving
            y = this.y - d;
            x = this.x + 1;
            if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                arr.push({
                    x: x,
                    y: y
                });
            }

            y = this.y - d;
            x = this.x - 1;
            if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                arr.push({
                    x: x,
                    y: y
                });
            }

            //check jumping
            y = this.y - d;
            x = this.x + 1;
            if (board.pieceAt(y, x)) {
                if (board.pieceAt(y, x)
                    .team !== this.team) {
                    y -= d;
                    x++;

                    if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                        // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                        arr.push({
                            x: x,
                            y: y,
                            jump: true
                        });
                    }
                }
            }

            y = this.y - d;
            x = this.x - 1;
            if (board.pieceAt(y, x)) {
                if (board.pieceAt(y, x)
                    .team !== this.team) {
                    y -= d;
                    x--;

                    if (!board.pieceAt(y, x) && y < 8 && y > -1 && x < 8 && x > -1) {
                        // console.log(this.x + ", " + this.y + ":" + x + ", " + y);
                        arr.push({
                            x: x,
                            y: y,
                            jump: true
                        });
                    }
                }
            }
        }
        return arr;
    };
}