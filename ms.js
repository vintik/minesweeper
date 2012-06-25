var ID_SEP = "_";
var MINE_FLAG = "F";

// results of Board.uncover
var UNCOVERED_NORMAL = 0,
UNCOVERED_MINE = 1,
UNCOVERED_ALL = 2,
UNCOVERED_ALREADY_UNCOVERED = 3,
UNCOVERED_MINE_FLAG = 4;

// main script
$(document).ready(function () {
    var controlsFlag = true;
    var boardEl = document.getElementById("board"),
    controlsEl = document.getElementById("controls");

    $("#new_game").on("click", function() {
	var width = Number(document.getElementById("width").value),
	height = Number(document.getElementById("height").value),
	num_mines = Number(document.getElementById("num_mines").value);

	toggleControls();
	var game = new Game(boardEl, width, height, num_mines, function () {
	    game.deleteBoardView();
	    game = null;
	    toggleControls();
	});
    });

    var toggleControls = function () {
	if (controlsFlag) {
	    controlsEl.style.display = "none";
	    controlsFlag = false;
	} else {
	    controlsEl.style.display = "block";
	    controlsFlag = true;
	}
    };
});

// The game UI object - creates the grid as divs with spans in them, each span's id is set to 
// idFromRC (row, column), e.g. 1_3 for row=1, column=3
var Game = function (el, width, height, num_mines, endGameCallback) {
    var _this = this;

    this.board = new Board(width, height, num_mines);
    this.boardEl = el;
    this.width = width;
    this.height = height;
    this.num_mines = num_mines;
    this.endGameCallback = endGameCallback;

    this.createBoardView();

    // TODO bug that the context menu still shows up
    $(this.boardEl).off("contextmenu.ms");
    $(this.boardEl).on("contextmenu.ms", function(e) {
	var el = e.originalEvent.srcElement ? e.originalEvent.srcElement : e.target;
	var rc = _this.rcFromId (el.id);
	var tile = _this.board.getTile(rc.row, rc.col);
	tile.mineFlag = ! tile.mineFlag;
	_this.drawTileEl(el, tile);
	return false;
    });

    // TODO - check if a srcElement is always a span
    $(this.boardEl).off("click.ms");
    $(this.boardEl).on("click.ms", function (e) {
	console.log(e);
	var el = e.originalEvent.srcElement ? e.originalEvent.srcElement : e.target;
	if (e.which === 1) { // left button
	    _this.makeMove(el);
	}
    });
};

// returns a span Id given its coordinates
Game.prototype.idFromRC = function(r, c) {
    return r + ID_SEP + c;
};

// returns a span's coordinates given its Id
Game.prototype.rcFromId = function(id) {
    var row_column = id.split(ID_SEP);
    return { 
	row: Number(row_column[0]),
	col: Number(row_column[1])
    };
};

// generates the "view" - divs and spans
Game.prototype.createBoardView = function() {
    var div, span;
    for (var i = 0; i < this.height; i++) {
	div = document.createElement('div');
	for (var j = 0; j < this.width; j++) {
	    span = document.createElement('span');
	    span.id=this.idFromRC (i, j);
	    div.appendChild(span);
	}
	this.boardEl.appendChild(div);
    }
    console.log(this.boardEl);
    $("#"+this.boardEl.id+" span").addClass("grid_cell");
};

// deletes the view - removing all divs and spans
Game.prototype.deleteBoardView = function() {
    $(this.boardEl).empty();
}

// draw's a tile given a row, column, and a tile object
Game.prototype.drawTileRC = function (r, c, tile) {
    var el = document.getElementById(Game.prototype.idFromRC(r, c));
    Game.prototype.drawTileEl(el, tile);

};

// draw's a tile given a target element and a tile object
Game.prototype.drawTileEl = function (el, tile) {
    if (tile.mineFlag) {
	el.innerHTML = MINE_FLAG;
	return;
    } 
    if (tile.uncovered) {
	el.innerHTML = tile.minesNear;
    } else {
	el.innerHTML = "";
    }
}

// processes a user move
Game.prototype.makeMove = function (el) {
    var rc = this.rcFromId (el.id);
    switch (this.board.uncover (rc.row, rc.col, this.drawTileRC)) {
    case UNCOVERED_MINE:
	alert ("you are blown to pieces");
	this.endGameCallback();
	break;
    case UNCOVERED_ALL:
	alert ("you win!");
	this.endGameCallback();
	break;
    case UNCOVERED_ALREADY_UNCOVERED:
    case UNCOVERED_MINE_FLAG:
	alert ("you can't");
	break;
    default:
    }
};

// the board model
function Board (width, height, num_mines) {
    var context;

    this.width = width;
    this.height = height;
    this.num_mines = num_mines;
    this.num_uncovered = 0;

    // get a random permutation array to seed the board with
    this.tiles = randperm(this.width*this.height);

    // convert from an array of numbers to tiles, populated with mines
    for (var i = 0; i < this.tiles.length; i++) {
	this.tiles[i] = {
	    uncovered: false,
	    minesNear: null,
	    mineFlag: false,
	    mine: this.tiles[i] < num_mines
	}	
    }

    // pre-calculate mine proximity totals for all tiles
    for (var row = 0; row < this.width; row++) {
	for (var col = 0; col < this.height; col++) {
	    context = { count : 0 };
	    this.iterateNeighbors (
		row, 
		col, 
		function (r, c, context) {
		    if (this.getTile(r,c).mine) {
			context.count ++;
		    }
		}, 
		context);
	    this.getTile(row, col).minesNear = context.count;
	}
    }

    return this;
}

// Uncovers a tile in response to a user's move.  May result in a cascade of uncovers 
// of the neighboring tiles.
Board.prototype.uncover = function (row, col, onTileChanged) {
    var tile = this.getTile(row, col);
    if (tile.mineFlag) {
	return UNCOVERED_MINE_FLAG;
    }
    if (tile.mine) {
	return UNCOVERED_MINE;
    }
    if (tile.uncovered) {
	return UNCOVERED_ALREADY_UNCOVERED;
    }
    
    tile.uncovered = true;
    this.num_uncovered++;
    onTileChanged (row, col, tile);

    // If the current tile is a 0, uncover all of its neighbors.  Otherwise uncover just those neighbors that are 0s.
    this.iterateNeighbors (
	row, col, 
	function (r, c, context) {
	    // 'this' is the board object as per iterateNeighbors
	    if (this.getTile(r, c).minesNear === 0 || context.forceUncover) {
		this.uncover(r, c, onTileChanged);
	    }
	}, 
	{ forceUncover : tile.minesNear === 0 } 
    );

    // if all non-mines are uncovered, the user wins
    if (this.num_mines + this.num_uncovered === this.width * this.height) {
	return UNCOVERED_ALL;
    }

    return UNCOVERED_NORMAL;
};

// Iterates over all neighbors of a tile, and executes the callback for each.
//   row, col: row and column of the "center" tile
//   processOneNeighbor: function (r, c, context) processes a single neighboring tile.  
//      r, c are the row and column of the tile
//      context is the context object that can be used for storing the state between the iterations.  
//      this is set to the Board object
//   context: an object that can be used to store state between iterations
Board.prototype.iterateNeighbors = function (row, col, processOneNeighbor, context) {
    var rmin = Math.max (0, row - 1);
    var rmax = Math.min (this.height-1, row + 1);
    var cmin = Math.max (0, col - 1);
    var cmax = Math.min (this.width-1, col + 1);
    
    // console.log ("------- iterateNeighbors: row: " + row + ", col:" + col + ", rminmax:" + rmin + ":" + rmax + ", cminmax:" + cmin + ":" + cmax);
    for (var r = rmin; r <= rmax; r++) {
	for (var c = cmin; c <= cmax; c++) {
	    if (processOneNeighbor.call (this, r, c, context) === false) {
		return;
	    }
	}
    }
    // console.log ("------- iterateNeighbors: done");
};

// Gets the tile reference given its row and column
Board.prototype.getTile = function(row, col) {
    return this.tiles[(row * this.width) + col];
};



/**
 * from http://groakat.wordpress.com/2012/02/14/random-permutation-of-integers-in-javascript/
 * return a random permutation of a range (similar to randperm in Matlab)
 */
function randperm(maxValue){
    // first generate number sequence
    var permArray = new Array(maxValue);
    for(var i = 0; i < maxValue; i++){
	permArray[i] = i;
    }
    // draw out of the number sequence
    for (var i = (maxValue - 1); i >= 0; --i){
	var randPos = Math.floor(i * Math.random());
	var tmpStore = permArray[i];
	permArray[i] = permArray[randPos];
	permArray[randPos] = tmpStore;
    }
    return permArray;
}

