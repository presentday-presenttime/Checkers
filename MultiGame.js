/*
	This will let me send a list of boards & games, and run them simultaniously.
	This may allow me to run through generations much faster.

	var boardList
	var canvasList
	var gameList
 */

function MultiGame() {
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
    var savedSeed = Math.random() * 10;

    this.fps = 60;

    function setSeed(seed) {
        var test = game;
        for (var i = game.playerOne.pieceList.length - 1; i >= 0; i--) {
            game.playerOne.pieceList[i].seed = game.savedSeed;
            game.playerTwo.pieceList[i].seed = game.savedSeed;
        }
    }

    this.updateHTML = function() {
        document.getElementById("Generation")
            .innerHTML = "Generation: " + currentGeneration;
        document.getElementById("totalWinLoss")
            .innerHTML = "Total Win/Loss: " + totalWin + ", " + totalLoss + ", " + totalTie + " : " + (totalWin / (totalLoss + totalWin))
            .toFixed(2);
        document.getElementById("generationWinLoss")
            .innerHTML = "This Generation Win/Loss: " + generationWin + ", " + generationLoss;
        document.getElementById("totalAverage")
            .innerHTML = "Overall Average Score: " + totalAverage.toFixed(2);
        document.getElementById("generationAverage")
            .innerHTML = "This Generation Average Score: " + currentAverage.toFixed(2);
        if (savedScores[0] !== undefined) {
            document.getElementById("scoreTable")
                .innerHTML = savedScores[0].getAverageScore()
                .toFixed(2) + "<br>" +
                savedScores[1].getAverageScore()
                .toFixed(2) + "<br>" + savedScores[2].getAverageScore()
                .toFixed(2) + "<br>";
        }
        if (savedScores[0] !== undefined && gameList[0].playerOne.pieceList[0].moveList[0] !== undefined) {
            //parentA.movelist[0].x
            //parentB.movelist[0].x
            //parentC.movelist[0].x
            //current.moveList[0].x
            document.getElementById("testXList")
                .innerHTML = savedScores[0].pieceList[0].id + ", " + savedScores[1].pieceList[0].id + ", " + savedScores[2].pieceList[0].id;
            document.getElementById("testX")
                .innerHTML = gameList[0].playerOne.pieceList[0].id;
        }
        for (var i = 0; i < gameList.length; i++) {
            document.getElementById("gameText" + i)
                .innerHTML = "Game: " + (i + currentGeneration * 10);
            document.getElementById("piecesLeftText" + i)
                .innerHTML = "AI: " + gameList[i].playerOne.getPieceCount() + ", VS: " + gameList[i].playerTwo.getPieceCount();
            document.getElementById("gameScoreText" + i)
                .innerHTML = "Score: " + gameList[i].playerOne.getAverageScore()
                .toFixed(2);
        }
    };

    this.start = function(parentList) {
        for (var i = 0; i < gameList.length; i++) {
            game = gameList[i];
            board = boardList[i];

            //set current player
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

        }
        window.requestAnimationFrame(multiGame.frame);
    };

    this.frame = function() {
        multiGame.updateHTML();
        var allGamesDone = true; //if any game is still going, keep in this generation.
        for (var i = 0; i < gameList.length; i++) {
            game = gameList[i];
            board = boardList[i];
            board.draw();
            if (!game.isDone) { //if the game is still going
                var p; //have the current player move
                if (game.currentPlayer) { //player 1
                    p = game.playerOne;
                } else { //player 0
                    p = game.playerTwo;
                }

                var tieCheck = p.move();
                if (tieCheck === false) {
                    game.tieCount++;
                }

                game.isDone = game.checkDone();
                //switch players
                game.currentPlayer = (game.currentPlayer === game.playerOne) ? game.playerTwo : game.playerOne;

                //go to next frame
                allGamesDone = false;
            } else if (!game.gameCheckedFlag) {
                game.gameCheckedFlag = true;

                var isWinner = (game.isDone === 1) ? true : false;

                if (isWinner) {
                    totalWin++;
                    generationWin++;
                } else if (game.isDone === 2) {
                    totalLoss++;
                    generationLoss++;
                } else if (game.isDone === 3) {
                    totalTie++;
                    // generationTie++;
                }

                game.playerOne.resetPieces();
                game.playerOne.generateScores(isWinner);

                // (game.playerOne.getAverageScore(isWinner) - game.averageScore) / (game.currentGame + 1);
                //average*amount + new value / amount+1
                currentAverage = (game.playerOne.getAverageScore() + (currentAverage * ((totalWin + totalLoss - 1) % 10))) / (((totalWin + totalLoss) % 10));
                totalAverage = (game.playerOne.getAverageScore() + (totalAverage * (totalWin + totalLoss - 1))) / (totalWin + totalLoss);

                bestAI.push(game.playerOne); //add to list
                bestAI.sort(
                    function(a, b) {
                        return b.getAverageScore() - a.getAverageScore();
                    }); //sort list
                bestAI.splice(leaders, bestAI.length - 1); //chop off extras

                game.currentGame++;
            }
        }
        if (!allGamesDone) {
            window.setTimeout(
                function() {
                    window.requestAnimationFrame(multiGame.frame);
                }, 1000 / multiGame.fps);
        } else { //generation is over
            currentGeneration++;
            generationWin = 0;
            generationLoss = 0;

            currentAverage = 0;

            //currentGame = 0;
            savedScores = bestAI;
            bestAI = [];
            window.requestAnimationFrame(
                function() {
                    multiGame.start(savedScores, savedSeed);
                });

        }
    };
}