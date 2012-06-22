var glob_tiles;
function Board (width, height) {
    console.log("creating board");
    // TODO - get rid of hard coded element
    this.element = document.getElementById("ms_board");
    this.width = width;
    this.height = height;
    this.tileAmount = width*height;
    this.tiles = [[],[]];
    // hard coded difficulty
    this.num_mines = Math.floor(this.tileAmount / 6);
    console.log("initialized props");

    this.initOrResetTiles();
    this.createBoardView();
//    this.element.addEventListener("click", function (e) {
    var _this = this;
    $(this.element).on("click", function (e) {
	_this.makeMove(e.originalEvent.srcElement);
    });
    glob_tiles = this.tiles;
    return this;
}

Board.prototype.createBoardView = function() {
    var div, span;
    for (var i = 0; i < this.height; i++) {
	div = document.createElement('div');
	for (var j = 0; j < this.width; j++) {
	    span = document.createElement('span');
	    span.id= i+"_"+j;
	    div.appendChild(span);
	    this.element.appendChild(div);
	}
    }
    $("#ms_board span").addClass("grid_cell");
};


Board.prototype.makeMove = function (el) {
    var row_column = el.id.split("_"),
    rowClicked = Number(row_column[0]),
    colClicked = Number(row_column[1]),
    tileClicked = this.tiles[rowClicked][colClicked],
    minesProx;
    console.log("made a move at: "+ el.id);

  // clicked on an already open tile
    if (typeof tileClicked === "number") {
	return;
    }

    // clicked on a mine
    if (tileClicked === true) {
	// TODO proper restart logic
	alert("Good game. You lose.");
	return;
    }
    
    // clicked on a closed tile, no mine
    console.log("no mine here, checking how many nearby");
    minesProx = this.calcProximity(rowClicked, colClicked);
    this.tiles[rowClicked][colClicked] = minesProx;
    el.innerHTML = minesProx.toString();
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

    for (i = 0; i < this.num_mines; i++) {
	minePosX = Math.floor(Math.random()*this.width);
	minePosY = Math.floor(Math.random()*this.height);
	if (this.tiles[minePosX][minePosY] === true) {
	    i--;
	    continue;
	}
	this.tiles[minePosX][minePosY] = true;
    }
//    console.log(util.inspect(this.tiles));
};


$(document).ready(function () {
    $("#boardSizeSubmit").on("click", function() {
	console.log("ms board clicked");
	boardWidth = $("#boardWidthInput").val();
	boardHeight = $("#boardHeightInput").val();
	if (boardWidth === "" || boardHeight === "") {
	    // TODO - some sort of alert/validation
	    return;
	}
	var board = new Board(Number(boardWidth), Number(boardHeight));
	console.log(board.tiles);
    });
});