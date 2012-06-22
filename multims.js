// TODO - remove after browser implementation
// var util = require("util");

// 


function Board (width, height) {
    console.log("creating board");
    this.element = $("#ms_board");
    this.width = width;
    this.height = height;
    this.tileAmount = width*height;
    this.tiles = [[],[]];
    // hard coded difficulty
    this.num_mines = Math.floor(this.tileAmount / 4);
    console.log("initialized props");

    this.initOrResetTiles();
    return this;
}

Board.prototype.createBoardView = function(tableElement) {
    var tr = "", td = "", rowString;
    for (var i = 0; i < this.height; i++) {
	rowString = "<tr>";
	for (var j = 0; j < this.width; j++) {
	    rowString += "<td id='"+i+"_"+j+"'></td>";
	}
	rowString += "</tr>";
	$(tableElement).append(rowString);

    }
    // TODO - figure out proper proportions
    $(tableElement).css({
	"border": "1px solid black",
	"width": "100%",
	"height": "500px"
    });
    // TODO - remove hard coded table id
    $("#ms_board tr, #ms_board td").css("border", "1px solid black");
};

// TODO - refactor to be row/column instead of x/y
Board.prototype.calcProximity = function (xClicked, yClicked) {
    var count = 0;
    for (var y = yClicked - 1; y <= yClicked + 1; y++) {
	//	    console.log("iter Y: "+i);
	for (var x = xClicked - 1; x <= xClicked + 1; x++) {
	    //		console.log("iter X: "+j);
	    if (y < 0 || x < 0 || y > this.height || x > this.width) {
		continue;
	    }
	    console.log("checking row: "+ y +", column"+ x);
	    if (this.tiles[y][x] === true) {
		console.log("Found a mine at row: " +y+", column: "+x);
		count++;
		    this.tiles[yClicked][xClicked] = count;
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

Board.prototype.makeMove = function (el) {
    var row_column = el.id.split("_");
    if (this.tiles[rowClicked][columnClicked] === true) {
	// TODO proper restart logic
	alert("Good game. You lose.");
	return;
    }
    var minesProx = board.calculateProximity(columnClicked, rowClicked);
    el.innerHTML = minesProx.toString();
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
	console.log(this);
	var board = new Board(Number(boardWidth), Number(boardHeight));
	board.createBoardView($("#ms_board"));
	$(board.element).on("click", function (e) {
	    board.makeMove(e.originalEvent.srcElement);
	});
    });
});