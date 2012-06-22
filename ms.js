// TODO - remove after browser implementation
var util = require("util");

function Board (width, height) {
    console.log("creating board");
    this.width = width;
    this.height = height;
    this.tileAmount = width*height;
    this.tiles = [];
    // hard coded difficulty
    this.num_mines = Math.floor(this.tileAmount / 4);
    console.log("initialized props");

    this.initOrResetTiles();

    return this;
}

Board.prototype.setMines = function () {
    console.log("setMines");
    var i,
    tempIndex = 0;
    
    for (i = 0; i < this.num_mines; i++) {
	temp = Math.floor(Math.random()*this.tileAmount);
	if (this.tiles[temp].mine === true) {
	    i--;
	    continue;
	}
	console.log("--- set a mine at index: "+ temp);
	this.tiles[temp].mine = true;
    }
//    console.log("Full board: ")
//    console.log(util.inspect(this));
    
};


Board.prototype.initOrResetTiles = function () {
    console.log("initOrResetTiles");
    var i;
    this.tiles = [];
    if (this.width === undefined || this.height === undefined) {
	console.log("Error: height and width have not been defined, please refresh the page.");
//	alert("Error: height and width have not been defined, please refresh the page.");
    }
    console.log("populating tiles");
    for (i = 0; i < this.tileAmount; i++) {
	this.tiles[i] = {};
	this.index = i;
	this.tiles[i].x = i % 4;
	this.tiles[i].y = Math.floor(i/this.width);
	this.mine = false;
    }
    console.log("finished populating tiles");
    this.setMines();
};


var board = new Board(10, 10);
console.log(util.inspect(board));