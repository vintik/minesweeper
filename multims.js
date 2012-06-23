var G_SCENARIOS = {
    CONTINUE: 1,
    END_GAME: 2
};

var _debug_tiles;
function Board (width, height, num_mines) {
    console.log("creating board");

    this.width = width;
    this.height = height;
    this.tileAmount = width*height;
    this.tiles = [[],[]];
    // hard coded difficulty
    this.num_mines = num_mines;
    this.initOrResetTiles();
//    this.element.addEventListener("click", function (e) {
    _debug_tiles = this.tiles;
    return this;
}


Board.prototype.uncover = function (row, col, callback) {
    tileClicked = this.tiles[row][col],
    minesProx;
    console.log("made a move at: "+ el.id);

  // clicked on an already open tile
    if (typeof tileClicked === "number") {
	// TODO beep?
	return G_SCENARIOS.CONTINUE;
    }

    // clicked on a mine
    if (tileClicked === true) {
	// TODO proper restart logic
	alert("Good game. You lose.");
	return G_SCENARIOS.END_GAME;
    }
    
    // clicked on a closed tile, no mine
    console.log("no mine here, checking how many nearby")
    minesProx = this.calcProximity(row, col);
    if (minesProx === 0) {

    }
    this.tiles[rowClicked][colClicked] = minesProx;
	callback();
    return
};




Board.prototype.calcProximity = function (rowClicked, colClicked) {
    console.log("calcProximity: row: "+ rowClicked + ", col: "+colClicked);
    var count = 0;
    console.log("---- Checking for mines:");
    for (var row = rowClicked - 1; row <= rowClicked + 1; row++) {
	console.log("row: "+row);
	for (var col = colClicked - 1; col <= colClicked + 1; col++) {
	    console.log("col: "+col);
	    if (col < 0 || row < 0 || col > this.height - 1 || row > this.width - 1) {
		console.log("out of bounds");
		
		// out of bounds
		continue;
	    }
//	    console.log("-- "+ y +", "+ x);
	    if (this.tiles[row][col] === true) {
		console.log("Found a mine at row: " +row+", column: "+col);
		count++;
	    }
	}
    }
    return count;
};


Board.prototype.initOrResetTiles = function () {
    console.log("initOrResetTiles");
    var i, j;
    this.tiles = [];
    if (this.width === undefined || this.height === undefined) {
	console.log("Error: height and width have not been defined, please refresh the page.");
//	alert("Error: height and width have not been defined, please refresh the page.");
    }
    console.log("populating tiles");

    for (i = 0; i < this.width; i++) {
	this.tiles[i] = [];

	for (j = 0; j < this.width; j++) {
	    this.tiles[i][j] = false;
	}
    }

    console.log("finished populating tiles");
//    console.log(util.inspect(this.tiles));

    // TODO this is a potential infinite loop

    for (i = 0; i < this.num_mines; i++) {
	minePosX = Math.floor(Math.random()*this.width);
	minePosY = Math.floor(Math.random()*this.height);
	// if there's alerady a mine there, put it some place else
	if (this.tiles[minePosX][minePosY] === true) {
	    i--;
	    continue;
	}
	this.tiles[minePosX][minePosY] = true;
    }
//    console.log(util.inspect(this.tiles));
};

// TODO - create game config
var Game = function (boardEl, widthEl, heightEl, difficulty) {
    this.boardEl = boardEl;
    this.width = Number(widthEl.innerHTML);
    this.height = Number(heightEl.innerHTML);
    this.mines = calcNumMines();
    
    // TODO - remove hard coded difficulty
    function calcNumMines () {
	return ((this.width * this.height) / 6);
    }
    this.newGame();
    this.createBoardView();

    var _this = this;
    $(this.boardEl).on("click", function (e) {
	_this.makeMove(e.originalEvent.srcElement);
    });

};


Game.prototype.makeMove = function (el) {
    var row_column = el.id.split("_"),
    rowClicked = Number(row_column[0]),
    colClicked = Number(row_column[1]),
    result = this.board.uncover(rowClicked, colClicked);
    // TODO
    switch (result) {
    }
};

Game.prototype.createBoardView = function() {
    var div, span;
    for (var i = 0; i < this.height; i++) {
	div = document.createElement('div');
	for (var j = 0; j < this.width; j++) {
	    span = document.createElement('span');
	    span.id= i+"_"+j;
	    div.appendChild(span);
	    // TODO why is this here and not in the outer loop?
	    this.element.appendChild(div);
	}
    }
    $("#ms_board span").addClass("grid_cell");
};



Game.prototype.newGame = function () {
    this.board = new Board(this.width, this.height, this.num_mines);
};



$(document).ready(function () {
    $("#boardSizeSubmit").on("click", function() {
	var boardEl = document.getElementById("boardEl"),
	width = document.getElementById("boardWidthInput").innerHTML,
	height = document.getElementById("boardHeightInput").innerHTML,
	difficulty = document.getElementById("gameDifficultyInput").innerHTML;
	var game = new Game(boardEl, width, height, difficulty);
    });
});