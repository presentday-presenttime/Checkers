/*
xxMake the pieces genetic instead of the whole game.
Have the piece look at: win > # of kills > isDead > isKing > how long it lasted

when it"s my turn to move, randomly(actually maybe higher scoring pieces shoud get priority?????) go through the list of pieces
and see if they can make the next move on their list.

This should increase the likely hood that the AI finds a valid move from a parent.
This also allows the AI to learn based on much more advanced input,
so moves that aren"t necissarily productive won"t mess up the score as much.
*/
function Game() {

    var currentGeneration = 0;
    var totalWin = 0;
    var generationWin = 0;
    var generationLoss = 0;
    var totalLoss = 0;
    var totalTie = 0;
    var totalAverage = 0;
    var currentAverage = 0;
    var savedScores = [];
    var bestAI = [];
    var population = 10;
    var leaders = 3;

    this.savedSeed = Math.random() * 10;
    this.seed = this.savedSeed;

    this.gameCheckedFlag = false; //for multiGame
    this.currentPlayer = Math.floor(Math.random() * 2 + 1);
    this.playerOne;
    this.playerTwo;
    this.interval;
    this.fps = 200;
    this.isDone = false;
    this.teamOneScore = 0;
    this.teamTwoScore = 0;
    this.teamOneCount = 0;
    this.teamTwoCount = 0;
    this.tieCount = 0;
    this.currentGame = 0; //counter
    this.averageScore = 0;



    function setSeed(seed) {
        var test = game;
        for (var i = game.playerOne.pieceList.length - 1; i >= 0; i--) {
            game.playerOne.pieceList[i].seed = game.savedSeed;
            game.playerTwo.pieceList[i].seed = game.savedSeed;
        }
    }

    function clearTable() {
        var i = 0;
        while (document.getElementById("curPieceFrom" + i)) {
            // console.log(document.getElementById("curPieceFrom" + i));
            try {
                var v = game.playerOne.pieceList[9];
                document.getElementById("curPieceFrom" + i)
                    .innerHTML = -1;
                document.getElementById("curPieceTo" + i)
                    .innerHTML = -1;
                document.getElementById("parentAFrom" + i)
                    .innerHTML = -1;
                document.getElementById("parentATo" + i)
                    .innerHTML = -1;
                document.getElementById("parentBFrom" + i)
                    .innerHTML = -1;
                document.getElementById("parentBTo" + i)
                    .innerHTML = -1;
            } catch (clearTableException) {
                // console.log("54" + clearTableException);
            }
            i++;
        }
    }

    function updateTable() {
        var v = game.playerOne.pieceList[9];

        var i = 0;
        while (document.getElementById("curPieceFrom" + i)) {
            try {
                document.getElementById("curPieceFrom" + i)
                    .innerHTML = v.moveList[i].savedX + ", " + v.moveList[i].savedY;
            } catch (updateTableException) {}
            i++;
        }

        i = 0;
        while (document.getElementById("curPieceTo" + i)) {
            try {
                document.getElementById("curPieceTo" + i)
                    .innerHTML = v.moveList[i].x + ", " + v.moveList[i].y;
            } catch (updateTableException) {}
            i++;
        }

        i = 0;
        while (document.getElementById("parentAFrom" + i)) {
            try {
                document.getElementById("parentAFrom" + i)
                    .innerHTML = v.parentA.moveList[i].savedX + ", " + v.parentA.moveList[i].savedY;
            } catch (updateTableException) {}
            i++;
        }

        i = 0;
        while (document.getElementById("parentATo" + i)) {
            try {
                document.getElementById("parentATo" + i)
                    .innerHTML = v.parentA.moveList[i].x + ", " + v.parentA.moveList[i].y;
            } catch (updateTableException) {}
            i++;
        }

        i = 0;
        while (document.getElementById("parentBFrom" + i)) {
            try {
                document.getElementById("parentBFrom" + i)
                    .innerHTML = v.parentB.moveList[i].savedX + ", " + v.parentB.moveList[i].savedY;
            } catch (updateTableException) {}
            i++;
        }

        i = 0;
        while (document.getElementById("parentBTo" + i)) {
            try {
                document.getElementById("parentBTo" + i)
                    .innerHTML = v.parentB.moveList[i].x + ", " + v.parentB.moveList[i].y;
            } catch (updateTableException) {}
            i++;
        }

        if (v.currentParent === v.parentA) {
            document.getElementById("aPiece")
                .innerHTML = "A";
            document.getElementById("bPiece")
                .innerHTML = "b";
        }
        if (v.currentParent === v.parentB) {
            document.getElementById("aPiece")
                .innerHTML = "a";
            document.getElementById("bPiece")
                .innerHTML = "B";
        }

        // for (var i = 0; i < 5; i++) {
        //     var p = game.playerOne;
        //     var c = p.pieceList[0].moveCount;
        //     if (p.pieceList[0].moveList[i] !== undefined) {
        //         document.getElementById("curPieceMove" + i).innerHTML = p.pieceList[0].moveList[i].x + "," + p.pieceList[0].moveList[i].y;
        //     }
        //     if (p.pieceList[0].parentA !== undefined && p.pieceList[0].parentB !== undefined) {
        //         if (p.pieceList[0].parentA.moveList[i + c] !== undefined && p.pieceList[0].parentB.moveList[i + c] !== undefined) {
        //             document.getElementById("parentAMove" + i).innerHTML = p.pieceList[0].parentA.moveList[i + c].x + "," + p.pieceList[0].parentA.moveList[i + c].y;
        //             document.getElementById("parentBMove" + i).innerHTML = p.pieceList[0].parentB.moveList[i + c].x + "," + p.pieceList[0].parentB.moveList[i + c].y;
        //         }
        //     }
        // }

    }

    this.updateHTML = function() {
        document.getElementById("Generation")
            .innerHTML = "Generation: " + currentGeneration;
        document.getElementById("totalWinLoss")
            .innerHTML = "Total Win/Loss: " + totalWin + ", " + totalLoss + ", " + totalTie + " : " + (totalWin / (totalLoss + totalWin))
            .toFixed(2);
        document.getElementById("generationWinLoss")
            .innerHTML = "This Generation Win/Loss: " + generationWin + ", " + generationLoss;
        // document.getElementById("totalAverage").innerHTML = "Overall Average Score: " + totalAverage.toFixed(2);
        // document.getElementById("generationAverage").innerHTML = "This Generation Average Score: " + currentAverage.toFixed(2);
        if (savedScores[0] !== undefined) {
            document.getElementById("scoreTable")
                .innerHTML = savedScores[0].getAverageScore()
                .toFixed(2) + "<br>" +
                savedScores[1].getAverageScore()
                .toFixed(2) + "<br>" + savedScores[2].getAverageScore()
                .toFixed(2) + "<br>";
        }
        var i = 0;
        document.getElementById("gameText" + i)
            .innerHTML = "Game: " + (i + currentGeneration * 10);
        document.getElementById("piecesLeftText" + i)
            .innerHTML = "AI: " + this.playerOne.getPieceCount() + ", VS: " + this.playerTwo.getPieceCount();
        document.getElementById("gameScoreText" + i)
            .innerHTML = "Score: " + this.playerOne.getAverageScore()
            .toFixed(2);
        updateTable();
    };

    this.start = function(parentList) {

        game.currentPlayer = (Math.floor(Math.random() * 2 + 1) === 0) ? game.playerOne : game.playerTwo;

        if (game.playerOne && game.playerTwo) {
            game.playerOne.resetPieces();
            game.playerTwo.resetPieces();
        }

        //draw board
        board.start(game);

        //create AI
        game.playerOne = new Team(0); //learns
        //DEBUG to see if my RNG is working properly.
        game.playerOne.genetic = true;
        game.playerOne.setPiecesGenetic(true);

        if (parentList !== undefined && parentList[0] !== undefined) {
            for (var i = 0; i < game.playerOne.pieceList.length; i++) {
                var x = Math.random();
                if (x < 3 / 6) {
                    game.playerOne.pieceList[i].parentA = parentList[0].pieceList[i];
                } else if (x < 5 / 6) {
                    game.playerOne.pieceList[i].parentA = parentList[1].pieceList[i];
                } else {
                    game.playerOne.pieceList[i].parentA = parentList[2].pieceList[i];
                }

                x = Math.random();
                if (x < 3 / 6) {
                    game.playerOne.pieceList[i].parentB = parentList[0].pieceList[i];
                } else if (x < 5 / 6) {
                    game.playerOne.pieceList[i].parentB = parentList[1].pieceList[i];
                } else {
                    game.playerOne.pieceList[i].parentB = parentList[2].pieceList[i];
                }

                x = Math.random();
                if (x < 1 / 2) {
                    game.playerOne.pieceList[i].currentParent = game.playerOne.pieceList[i].parentA;
                } else {
                    game.playerOne.pieceList[i].currentParent = game.playerOne.pieceList[i].parentB;
                }

                //we don't need grandparents, lets save some memory.
                game.playerOne.pieceList[i].parentA.parentA = undefined;
                game.playerOne.pieceList[i].parentA.parentB = undefined;
                game.playerOne.pieceList[i].parentB.parentA = undefined;
                game.playerOne.pieceList[i].parentB.parentB = undefined;
            }
        }

        game.playerTwo = new Team(1); //random

        //start game loop
        game.isDone = false;
        game.tieCount = 0;

        setSeed(game.savedSeed);

        window.requestAnimationFrame(game.frame);
    };

    this.frame = function() {

        game.updateHTML();
        board.draw();

        //if the game is still going
        if (!game.isDone) {

            var p = game.currentPlayer; //have the current player move
            if(p === undefined){
                p = game.playerOne;
            }
            // if (game.currentPlayer) { //player 1
            //     p = game.playerOne;
            // } else { //player 0
            //     p = game.playerTwo;
            // }

            var tieCheck;
            if (p.genetic === true) {
                tieCheck = p.move();
            } else {
                tieCheck = p.moveRandom();
            }

            //if we aren't unable to move n times, just call it a tie.
            if (tieCheck === false) {
                game.tieCount++;
            }

            game.isDone = game.checkDone();
            //switch players
            game.currentPlayer = (game.currentPlayer === game.playerOne) ? game.playerTwo : game.playerOne;

            //go to next frame
            window.setTimeout(
                function() {
                    window.requestAnimationFrame(game.frame);
                }, 1000 / game.fps);
        } else {
            //game has ended
            //game.isDone: 3 = tie, 1 = win, 2 = loss
            if (game.isDone === 1) {
                totalWin++;
            } else if (game.isDone === 2) {
                totalLoss++;
            } else if (game.isDone === 3) {
                totalTie++;
            }

            var isWinner = (game.isDone === 1) ? true : false;
            game.playerOne.resetPieces(); //sort pieces
            game.playerOne.generateScores(isWinner);

            currentAverage = (game.playerOne.getAverageScore() + (currentAverage * ((totalWin + totalLoss - 1) % 10))) / (((totalWin + totalLoss) % 10));
            totalAverage = (game.playerOne.getAverageScore() + (totalAverage * (totalWin + totalLoss - 1))) / (totalWin + totalLoss);

            bestAI.push(game.playerOne); //add to list
            bestAI.sort(
                function(a, b) {
                    return b.getAverageScore() - a.getAverageScore();
                }); //sort list
            if (leaders < population) {
                bestAI.splice(leaders, bestAI.length - 1); //chop off extras
            }
            // console.log(bestAI.length);
            // console.log(savedScores.length);

            //get overall average score
            //game.averageScore += (game.playerOne.getAverageScore(isWinner) - game.averageScore) / (game.currentGame + 1);

            //increment game
            game.currentGame++;

            if (game.currentGame < population) { //if we are still on the current generation
                //reset table
                clearTable();

                window.requestAnimationFrame(
                    function() {
                        game.start(savedScores);
                    });
            } else { //else increment generation
                currentGeneration++;
                //console.log("done with generation:");
                generationWin = 0;
                generationLoss = 0;
                currentAverage = 0;
                currentGame = 0;
                game.currentGame = 0;
                savedScores = bestAI.slice(0);
                bestAI = [];
                //reset table
                clearTable();
                window.requestAnimationFrame(
                    function() {
                        game.start(savedScores);
                    }
                );
            }
        }
    };

    this.checkDone = function() {
        if (this.playerOne.getPieceCount() === 0) { //team two wins (loss)
            this.teamTwoScore++;
            return 2;
        }
        if (this.playerTwo.getPieceCount() === 0) { //team one wins (win)
            this.teamOneScore++;
            return 1;
        }
        if (game.tieCount >= 2) { //tie (loss)
            return 3;
        }
        //need to add tie game case.

        return 0;
    };

    this.move = function(piece, xCoord, yCoord) {
        //only move pieces on the board
        if (piece.x < 0 || piece.y < 0) {
            // console.log("that piece isn"t on the board");
            return false;
        }
        //only move on the board
        if (xCoord < 0 || xCoord > 7 || yCoord < 0 || yCoord > 7) {
            // console.log("no moving off the board");
            return false;
        }
        //only move diagonal
        if (Math.abs(piece.x - xCoord) - Math.abs(piece.y - yCoord) !== 0) {
            // console.log("only move diagonal");
            return false;
        }

        //only move forward if not a king
        if (!piece.isKing) {
            //team 0 only moves down (up in value)
            if (piece.team === 0) {
                if (piece.y > yCoord) {
                    // console.log("only kings can move backwards");
                    return false;
                }
            } else {
                if (piece.y < yCoord) {
                    // console.log("only kings can move backwards");
                    return false;
                }
            }
        }
        //can"t move onto other pieces
        if (board.pieceAt(yCoord, xCoord)) {
            // console.log("can"t move ontop of other pieces" + piece.x + ", " + piece.y + ", " + xCoord + ", " + yCoord);
            return false;
        }

        //if moving more than 1 sqare
        if (Math.abs(piece.x - xCoord) + Math.abs(piece.y - yCoord) !== 2) {
            //only move 2 sqares
            if (Math.abs(piece.x - xCoord) + Math.abs(piece.y - yCoord) !== 4) {
                // console.log("you can"t move that far");
                return false;
            }
            //must be jumping
            if (board.pieceAt(Math.abs(piece.y + yCoord) / 2, Math.abs(piece.x + xCoord) / 2) === undefined) {
                // console.log("only move one sqare unless jumping");
                return false;
            }
            if (board.pieceAt(Math.abs(piece.y + yCoord) / 2, Math.abs(piece.x + xCoord) / 2)
                .team === piece.team) {
                // console.log("must jump over enemy piece to move more than one sqare");
                return false;
            }

            //remove the piece we"ve jumped over
            board.removePieceAt(Math.abs(piece.y + yCoord) / 2, Math.abs(piece.x + xCoord) / 2);
            piece.killCount++;
        }

        piece.x = xCoord;
        piece.y = yCoord;

        if (piece.team === 0 && piece.y === 7)
            piece.isKing = true;
        if (piece.team === 1 && piece.y === 0)
            piece.isKing = true;

        return true;
    };

    this.checkMove = function(piece, xCoord, yCoord) {
        if (piece.x < 0 || piece.y < 0)
            return false;
        //only move on the board
        if (xCoord < 0 || xCoord > 7 || yCoord < 0 || yCoord > 7)
            return false;
        //only move diagonal
        if (Math.abs(piece.x - xCoord) - Math.abs(piece.y - yCoord) !== 0)
            return false;

        //only move forward if not a king
        if (!piece.isKing) {
            //team 0 only moves down (up in value)
            if (piece.team === 0) {
                if (piece.y > yCoord)
                    return false;
            } else {
                if (piece.y < yCoord)
                    return false;
            }
        }
        //can"t move onto other pieces
        if (board.pieceAt(yCoord, xCoord))
            return false;

        //if moving more than 1 sqare
        if (Math.abs(piece.x - xCoord) + Math.abs(piece.y - yCoord) !== 2) {
            //only move 2 sqares
            if (Math.abs(piece.x - xCoord) + Math.abs(piece.y - yCoord) !== 4)
                return false;
            //must be jumping
            if (board.pieceAt(Math.abs(piece.y + yCoord) / 2, Math.abs(piece.x + xCoord) / 2) === undefined)
                return false;
            if (board.pieceAt(Math.abs(piece.y + yCoord) / 2, Math.abs(piece.x + xCoord) / 2)
                .team === piece.team)
                return false;
        }

        return true;
    };

}