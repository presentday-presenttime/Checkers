function Board(canvas, rows, cols) {
    this.rows = rows;
    this.cols = cols;

    //Initilize variables
    var PieceWidth = 10;
    var PieceHeight = 10;
    var BoardWidth = 1 + (cols * PieceWidth);
    var BoardHeight = 1 + (rows * PieceHeight);
    canvas.width = BoardWidth;
    canvas.height = BoardHeight;
    var DrawContext = canvas.getContext("2d");

    this.draw = function(selectedRow, selectedCol) {

        //clear the canvas
        DrawContext.clearRect(0, 0, BoardWidth, BoardHeight);
        DrawContext.beginPath();

        //Vertical Lines
        for (var x = 0; x <= BoardWidth; x += PieceWidth) {
            DrawContext.moveTo(0.5 + x, 0);
            DrawContext.lineTo(0.5 + x, BoardHeight);
        }

        //Horizontal
        for (var y = 0; y <= BoardHeight; y += PieceHeight) {
            DrawContext.moveTo(0, 0.5 + y);
            DrawContext.lineTo(BoardWidth, 0.5 + y);
        }
        DrawContext.strokeStyle = "#ccc";
        DrawContext.stroke();

        //fill in "checker pattern" (every other square lighter color).
        var odds = 1;
        for (var currentRow = 0; currentRow < rows; currentRow++) {
            for (var currentCol = 0; currentCol < cols; currentCol++) {
                if ((currentCol & 1) !== odds) {
                    DrawContext.fillStyle = "#eeeeee";
                } else {
                    DrawContext.fillStyle = "#dddddd";
                }
                DrawContext.fillRect(currentRow * PieceHeight + 0.5, currentCol * PieceWidth + 0.5, PieceHeight, PieceWidth);
            }
            odds = odds ^ 1;
        }

        function drawCircle(posX, posY, radius, lineWidth, color) {
            if (radius < 1) {
                radius = 1;
            }

            DrawContext.beginPath();
            DrawContext.lineWidth = lineWidth;
            DrawContext.arc(posX, posY, radius, 0, Math.PI * 2, false);
            DrawContext.closePath();
            DrawContext.strokeStyle = color;
            DrawContext.stroke();
        }

        //draw pieces
        if (!game.playerOne || !game.playerTwo) {
            return;
        }

        var radius = (PieceWidth / 2) - (PieceWidth / 10);
        var listOne = game.playerOne.pieceList;
        var listTwo = game.playerTwo.pieceList;

        for (var i = 0; i < listOne.length; i++) {
            var circleX = (listOne[i].x * PieceWidth) + (PieceWidth / 2);
            var circleY = (listOne[i].y * PieceWidth) + (PieceWidth / 2);
            var color = (listOne[i].team === 0) ? "#ed1c24" : "#00a2e8";
            if (i === 9) {
                color = "#00b300";
            }

            drawCircle(circleX, circleY, radius, 4, color);

            //draw king different
            if (listOne[i].isKing) {
                drawCircle(circleX, circleY, radius - 4, 2, color);
                drawCircle(circleX, circleY, radius - 8, 2, color);
                drawCircle(circleX, circleY, radius - 12, 2, color);
                drawCircle(circleX, circleY, radius - 16, 1, color);
            }

            if (selectedRow === listOne[i].y && selectedCol === listOne[i].x) {
                DrawContext.fillStyle = color;
                DrawContext.fill();
            }

            circleX = (listTwo[i].x * PieceWidth) + (PieceWidth / 2);
            circleY = (listTwo[i].y * PieceWidth) + (PieceWidth / 2);
            color = (listTwo[i].team === 0) ? "#ed1c24" : "#00a2e8";

            drawCircle(circleX, circleY, radius, 4, color);

            //draw king different
            if (listTwo[i].isKing) {
                drawCircle(circleX, circleY, radius - 4, 2, color);
                drawCircle(circleX, circleY, radius - 8, 2, color);
                drawCircle(circleX, circleY, radius - 12, 2, color);
                drawCircle(circleX, circleY, radius - 16, 1, color);
            }

            if (selectedRow === listTwo[i].y && selectedCol === listTwo[i].x) {
                DrawContext.fillStyle = color;
                DrawContext.fill();
            }
        }
    };

    //handles the computer"s turn
    var compTurn = function() {
        var possibleMoves = new Checkers.moveList(game.board.area());
        game.board.fillMoveList(possibleMoves);
        var result;
        if (moves.length > 1) {
            //genetic code goes here
        } else {
            //if there is only one option, just choose it.
            move = possibleMoves.list[0];
        }
        var winner = game.move(result.fromRow, result.fromCol, result.toRow, result.toCol);
        if (winner) {
            //do something on win condition
            var color = (winner === Checkers.playerOne) ? "Red" : "Blue";
            return;
        }
        draw(game.board);
        if (game.inMultiTurn()) {
            setTimeout(computerPlay, 400);
        }
    };

    var savedPiece;
    var selectedRow;
    var selectedCol;
    var onClick = function(e) {
        var x, y;
        if (e.pageX !== undefined && e.pageY !== undefined) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        x = Math.min(x, cols * PieceWidth);
        y = Math.min(y, rows * PieceHeight);

        var row = Math.floor(y / PieceHeight);
        var col = Math.floor(x / PieceWidth);

        //Only allow clicking if it"s the user"s turn
        //if()

        var piece = game.board.pieceAt(row, col);
        if (piece) {
            selectedCol = col; //update so we know what"s selected on next click
            selectedRow = row;
            savedPiece = piece;
            draw(row, col);
            return;
        }

        //if no piece is selected & they aren"t selecting a piece, return
        if (savedPiece === undefined) {
            return;
        }

        try {
            game.move(savedPiece, col, row); //try to move the piece
            draw(row, col);
        } catch (unableToMoveException) {
            alert("Exception: " + unableToMoveException);
            draw(selectedRow, selectedCol);
        }

    };

    this.start = function(gameArg) {
        canvas.addEventListener("click", onClick, false);
        this.draw();
    };

    this.pieceAt = function(y, x) {
        for (var i = 0; i < game.playerOne.pieceList.length; i++) {
            if (game.playerOne.pieceList[i].x === x && game.playerOne.pieceList[i].y === y) {
                return game.playerOne.pieceList[i];
            }
            if (game.playerTwo.pieceList[i].x === x && game.playerTwo.pieceList[i].y === y) {
                return game.playerTwo.pieceList[i];
            }
            // for (var j = 0; j < this.pieceList[i].length; j++) {
            //     if(this.pieceList[i][j].x == col && this.pieceList[i][j].y == row)
            //         return this.pieceList[i][j];
            // };
        }
    };

    this.removePieceAt = function(y, x) {
        for (var i = 0; i < game.playerOne.pieceList.length; i++) {
            if (game.playerOne.pieceList[i].x === x && game.playerOne.pieceList[i].y === y) {
                game.playerOne.pieceList[i].isDead = true;
                game.playerOne.pieceList[i].x = -1;
                game.playerOne.pieceList[i].y = -1;
            }
            if (game.playerTwo.pieceList[i].x === x && game.playerTwo.pieceList[i].y === y) {
                game.playerTwo.pieceList[i].isDead = true;
                game.playerTwo.pieceList[i].x = -1;
                game.playerTwo.pieceList[i].y = -1;
            }
            // for (var j = 0; j < this.pieceList[i].length; j++) {
            //     if(this.pieceList[i][j].x == col && this.pieceList[i][j].y == row){
            //         this.pieceList[i][j].isDead = true;
            //         this.pieceList[i][j].x = -1;
            //         this.pieceList[i][j].y = -1;
            //         //this.pieceList[i][j] = -1;
            //     }
            // };
        }
    };
}