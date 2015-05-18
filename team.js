/*
    Play n games & record moves
    score based on: how long they lasted -> if they won -> how fast they won
    repeat for m generations
    creat new opponent?

 */
/**
 * Object that controlls the 'players' actions, stores everything needed for teamOne/teamTwo
 * @param {int} teamNum 0 (teamOne) or 1 (teamTwo)
 */
function Team(teamNum) {

    this.teamNum = teamNum;
    this.genetic = false;
    this.pieceList;
    this.score = 0;
    this.moveCount = 0;
    this.currentParent;

    this.moveRandom = function() {
        //copy the array
        var arr = this.pieceList.slice(0);
        //shuffle the list
        arr = this.pieceList[0].shuffle(arr);
        for (var i = 0; i < arr.length; i++) {
            var attempt = arr[i].moveRandom();
            if (attempt) {
                return true;
            }
        }

        return undefined;
    };

    this.move = function() {
        //copy the array
        var arr = this.pieceList.slice(0);

        //get the best(or random) piece
        if (arr[0].currentParent) {
            arr.sort(function(a, b) {
                return b.currentParent.score - a.currentParent.score;
            });
        }
        //try and make it move
        for (var i = 0; i < arr.length; i++) {
            var attempt = arr[i].move();
            if (attempt !== undefined) { //if we move succesfully, were just done moving.
                return true;
            }
        }
        //if we can't find a move, try to move randomly
        var randomAttempt = this.moveRandom();
        if (randomAttempt !== undefined) {
            return true;
        }
        //if we can't move randomly either check if we are done, and return false
        game.isDone = game.checkDone();
        console.log("team " + this.teamNum + " can't find a valid move.");

        return false;
    };

    this.getHeadNode = function() {
        var node = this.currentMove;

        if (node === undefined){
            return node;
        }

        while (node.prev !== undefined){
            node = node.prev;
        }

        return node;
    };

    this.getTailNode = function() {
        var node = this.currentMove;

        if (node === undefined){
            return node;
        }

        while (node.next !== undefined){
            node = node.next;
        }

        return node;
    };

    this.at = function(x) {
        var node = this.getHeadNode();

        for (var i = 0; i < x; i++) {
            if (node === undefined){
                return node;
            }
            node = node.next;
        }

        return node;
    };

    var savedMove = function(piece, x, y) {
        this.piece = piece;
        this.x = x;
        this.y = y;
        this.prev = undefined;
        this.next = undefined;

        this.overwrite = function(savedMove) {
            this.piece = savedMove.piece;
            this.x = savedMove.x;
            this.y = savedMove.y;
        };
    };



    this.resetPieces = function() {
        this.pieceList.sort(function(a, b) {
            return a.id - b.id;
        });

        for (var i = 0; i < this.pieceList.length; i++) {
            var yCoord = Math.floor(i / 4) + (5 * this.teamNum);
            var xCoord = ((i * 2) + 1 + (4 * this.teamNum) - yCoord) % 8;

            this.pieceList[i].x = xCoord;
            this.pieceList[i].y = yCoord;
            this.pieceList[i].isKing = false;
            this.pieceList[i].isDead = false;

            if (this.genetic){
                this.pieceList[i].genetic = true;
            }
            if (this.pieceList[i].parentA !== undefined && this.pieceList[i].parentB !== undefined) {
                this.pieceList[i].score = (this.pieceList[i].parentA.score + this.pieceList[i].parentB.score) / 2;
            }
        }
    };

    this.generatePieceList = function() {
        var arr = new Array(12);

        for (var i = 0; i < arr.length; i++) {
            var yCoord = Math.floor(i / 4) + (5 * this.teamNum);
            var xCoord = ((i * 2) + 1 + (4 * this.teamNum) - yCoord) % 8;

            arr[i] = new Piece(i, this.teamNum, xCoord, yCoord);

            if (this.genetic){
                arr[i].genetic = true;
            }
        }

        return arr;
    };
    this.pieceList = this.generatePieceList();

    this.getPieceCount = function() {
        var count = 0;

        for (var i = 0; i < this.pieceList.length; i++) {
            if (!this.pieceList[i].isDead)
                count++;
        }

        return count;
    };

    this.generateScores = function(isWinner) {
        for (var i = 0; i < this.pieceList.length; i++) {
            this.pieceList[i].generateScore(isWinner);
        }
    };

    this.getAverageScore = function() {
        var value = 0;

        for (var i = 0; i < this.pieceList.length; i++) {
            value += this.pieceList[i].score / this.pieceList.length;
        }

        this.score = value;
        return value;
    };

    this.setPiecesGenetic = function(bool) {
        for (var i = 0; i < this.pieceList.length; i++) {
            this.pieceList[i].genetic = bool;
        }
    };

}