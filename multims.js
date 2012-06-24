var UNCOVERED_NORMAL = 0,
    UNCOVERED_MINE = 1,
    UNCOVERED_ALL = 2;

var _debug_tiles;

function Board (width, height, num_mines) {
    // console.log("New board: width=" + width + ", height=" + height + ", num_mines=" + num_mines);

    this.width = width;
    this.height = height;
    this.tiles = null;
    this.num_mines = num_mines;

    this.initOrResetTiles();
    this.calcTileValues();

    _debug_tiles = this.tiles;
    return this;
}


Board.prototype.initOrResetTiles = function () {
    console.log("initOrResetTiles");
    var i, j;
    this.tiles = [];
    if (this.width === undefined || this.height === undefined) {
	console.log("Error: height and width have not been defined, please refresh the page.");
//	alert("Error: height and width have not been defined, please refresh the page.");
    }
    console.log("populating tiles" + this.width + this.height);

    for (i = 0; i < this.width; i++) {
	this.tiles[i] = [];

	for (j = 0; j < this.width; j++) {
	    this.tiles[i][j] = {
		row: i,
		column: j,
		mine: false,
		uncovered: false,
		minesNear: 0
	    };
	}
    }

    console.log("finished populating tiles");
    console.log(this.tiles);
//    console.log(util.inspect(this.tiles));
    console.log("LOOOL");
    console.log(this.num_mines);
    // TODO this is a potential infinite loop
    for (i = 0; i < this.num_mines; i++) {
	minePosX = Math.floor(Math.random()*this.width);
	minePosY = Math.floor(Math.random()*this.height);
	// if there's alerady a mine there, put it some place else
	if (this.tiles[minePosX][minePosY].mine === true) {
	    i--;
	    continue;
	}
	console.log("setting mine at row: "+minePosX+", col: "+minePosY);
	this.tiles[minePosX][minePosY].mine = true;
    }
//    console.log(util.inspect(this.tiles));
};

Board.prototype.calcTileValues = function () {
    console.log("calcTileValues");
    for (var row = 0; row < this.width; row++) {
	for (var col = 0; col < this.height; col++) {
	    this.tiles[row][col].minesNear = this.calcProximity(row, col);
	}
    }
};

Board.prototype.uncover = function (row, col, callback) {
    var tileClicked = this.tiles[row][col];
    // clicked on a mine
    if (tileClicked.mine === true) {
	// TODO proper restart logic
	alert("Good game. You lose.");
	return UNCOVERED_MINE;
    }
    
    // clicked on an already open tile
    if (tileClicked.uncovered === true) {
	// TODO beep?
	return UNCOVERED_NORMAL;
    }

    tileClicked.uncovered = true;

    var checkAllNear = function (uncoverFlag) {
	console.log(this);
	for (var r = row - 1; r <= row + 1; r++) {
	    //	    console.log("row: "+r);
	    for (var c = col - 1; c <= col + 1; c++) {
		//		console.log("col: "+c);
		if (c < 0 || r < 0 || c > this.height - 1 || r > this.width - 1) {
		    continue;
		}
		console.log("R: "+r+", C: "+c);
		if (this.tiles[r][c].minesNear === 0) {
		    this.uncover(r, c, callback);
		} else if (uncoverFlag) {
		    this.uncover(r, c, callback);
		}
	    }
	}
    };

    // clicked on a closed tile, no mine
    if (tileClicked.minesNear === 0) {
	checkAllNear.call(this, true);
    } else {
	checkAllNear.call(this, false);
//	checkAllNear(false);
    }

    callback(tileClicked);
    return UNCOVERED_NORMAL;
};



// change clicked - knows nothing about clicks
Board.prototype.calcProximity = function (rowClicked, colClicked) {
    console.log("calcProximity: row: "+ rowClicked + ", col: "+colClicked);
    var count = 0;
//    console.log("---- Checking for mines:");
    for (var row = rowClicked - 1; row <= rowClicked + 1; row++) {
//	console.log("row: "+row);
	for (var col = colClicked - 1; col <= colClicked + 1; col++) {
//	    console.log("col: "+col);
	    if (col < 0 || row < 0 || col > this.height - 1 || row > this.width - 1) {
//		console.log("out of bounds");
		
		// out of bounds
		continue;
	    }
//	    console.log("-- "+ y +", "+ x);
	    if (this.tiles[row][col].mine === true) {
//		console.log("Found a mine at row: " +row+", column: "+col);
		count++;
	    }
	}
    }
    return count;
};


// TODO - create game config
var Game = function (boardEl, width, height, difficulty) {
    var num_tiles = 0;
    this.boardEl = boardEl;
    this.width = width;
    this.height = height;
    num_tiles = this.width * this.height;
    console.log(num_tiles);
    this.num_mines = calcNumMines();
    
    // TODO - remove hard coded difficulty
    function calcNumMines () {
	console.log("nummines");
	console.log(Math.floor(num_tiles / 6));
	return (Math.floor(num_tiles / 6));
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
    result = this.board.uncover(rowClicked, colClicked, function (tile) {
	$("#"+tile.row+"_"+tile.column).text(tile.minesNear);
    });
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
	    this.boardEl.appendChild(div);
	}
    }
    $("#ms_board span").addClass("grid_cell");
};



Game.prototype.newGame = function () {
    this.board = new Board(this.width, this.height, this.num_mines);
};



$(document).ready(function () {
    $("#boardSizeSubmit").on("click", function() {
	var boardEl = document.getElementById("ms_board"),
	width = Number(document.getElementById("boardWidthInput").value),
	height = Number(document.getElementById("boardHeightInput").value),
	difficulty = Number(document.getElementById("gameDifficultyInput").value);

	var game = new Game(boardEl, width, height, difficulty);
    });
});