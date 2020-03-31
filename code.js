var rows = 50;
var cols = 75;
var playing = false;   //true when game is running.


//model
var grid = new Array(rows);
var nextGrid = new Array(rows);

var timer;
var reproductionTime = 100;  //milliseconds between generations

function intializeGrids() {
	//build 2 D array for remembering state
	for (var i=0; i<rows; i++) {
		grid[i] = new Array(cols);
		nextGrid[i] = new Array(cols);
	}
}

// initialize or reset Grids to all dead 
function resetGrids() {
	for (var i = 0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			grid[i][j] = 0;	//set to dead
			nextGrid[i][j] = 0;  // is this necessary?
		}
	}
}

function copyAndResetGrid() {
	for (var i=0; i < rows; i++) {
		for (var j = 0; j < cols; j++) {
			grid[i][j] = nextGrid[i][j];
			nextGrid[i][j] = 0;
		}
	}
}


//initialize
function initialize() {
	createTable();
	intializeGrids();
	resetGrids();
	setupControlButtons();
}

// layout the board
function createTable() {
	// get the gridContainer from the HTML file
	var gridContainer= document.getElementById("gridContainer");
	if (!gridContainer) {  // does it exist?
		//throw error
		console.error("Problem: no div for the grid table!");
	}	
	// build the table
	var table = document.createElement("table");
	
	for (var i=0; i < rows; i++) {
		var tr = document.createElement("tr");
		for (var j = 0; j < cols; j++) {
				var cell = document.createElement("td");
				cell.setAttribute("id",i+"_"+j);
				cell.setAttribute("class","dead");
				cell.onclick = cellClickHandler;
				tr.appendChild(cell);	// add the cell to this row
		}
		table.appendChild(tr);	//add this row to the table
	}
	gridContainer.appendChild(table);	// add this table to the gridContainer
}

// when a cell is clicked, change it's state
function cellClickHandler(){
	var rowcol = this.id.split("_");	//get row and column
	var row = rowcol[0];
	var col = rowcol[1];
	
	var classes = this.getAttribute("class");
	if (classes.indexOf("live") > -1) {
		this.setAttribute("class", "dead");
		grid[row][col] = 0;
	} else {
		this.setAttribute("class", "live");
		grid[row][col]=1;
	}
}

function updateView() {
	for (var i=0; i < rows; i++) {
		for (var j=0; j < cols; j++) {
			var cell = document.getElementById(i+"_"+j)
			if (grid[i][j] == 0) {
				cell.setAttribute ("class", "dead");
			} else {
				cell.setAttribute("class", "live");
			}
		}
	}
}

// add click handlers for buttons
function setupControlButtons(){
	//button to start
	var startButton = document.getElementById("start");
	startButton.onclick = startButtonHandler;
	
	//button to clear
	var clearButton = document.getElementById("clear");
	clearButton.onclick = clearButtonHandler;
	
	//see the grid randomly
	var randomButton = document.getElementById("random");
	randomButton.onclick = randomButtonHandler;
}

// the Clear button was clicked
function clearButtonHandler() {
	console.log("Clear the game; stop playing; clear the grid");
	playing = false;
	var startButton = document.getElementById("start");
	startButton.innerHTML = "start";
	resetGrids();
	//updateView();  // This does the same thing as the code below.
	var cellsList = document.getElementsByClassName("live");  // this list changes as we change elements in the list
	var cells=[];		// copy the list into an array that doesn't change
	for (var i=0; i < cellsList.length; i++) {
		cells.push(cellsList[i]);
	}
	
	for (var i=0; i < cells.length; i++) {
		cells[i].setAttribute("class", "dead");
	}
	clearTimeout(timer);	//stop calling play() when the timer hits
}

// the start/pause/continue button was clicked
function startButtonHandler() {
	if (playing) {
		console.log("Pause the game");
		playing = false;
		this.innerHTML = "continue";
		clearTimeout(timer);	//stop calling play() when the timer hits
	} else {
		console.log("Continue the game");
		playing = true;
		this.innerHTML = "pause";
		play();
	}
}

function randomButtonHandler() {
	if (playing) return;
	clearButtonHandler();	// stop playing and clear the grid
	for (var i=0; i < rows; i++) {
		for (var j=0; j < cols; j++) {
			// Generate a random 1 or 0
			var isLive = Math.round(Math.random());
			if (isLive == 1) {
					var cell = document.getElementById(i+"_"+j);
					cell.setAttribute("class","live");
					grid[i][j]=1;
			}
		}
	}
			
}

function play() {
	console.log("Play the game");
	computeNextGen();
	
	if (playing) {
		timer = setTimeout(play, reproductionTime);
	}
}

function computeNextGen() {
	for (var i=0; i < rows; i++) {
		for (var j=0; j < cols; j++) {
			applyRules(i,j);
		}
	}
	// copy nextGrid to grid, and reset nextGrid
	copyAndResetGrid();
	// copy all 1 values to "live" in the table
	updateView();
}

function applyRules(row, col) {
	var numNeighbors = countNeighbors(row, col);
	if (grid[row][col] == 1)  {	//live cell
		if (numNeighbors < 2) {
			nextGrid[row][col] = 0;
		} else if (numNeighbors == 2 || numNeighbors == 3) {
			//redundant?
			nextGrid[row][col] = 1;
		} else if (numNeighbors > 3) {
			nextGrid[row][col] = 0;
		}
	} else if (grid[row][col] == 0) { 	// redundant?
		if (numNeighbors == 3) {
				nextGrid[row][col] = 1;
		}
	}	
}


function countNeighbors(row,col) {
	var count = 0;
	if (row-1 >= 0) {			//cell above
		if (grid[row-1][col] == 1) count++;
	}
	if (row-1 >= 0 && col-1 >= 0) {	// cell to upper left
		if (grid[row-1][col-1] == 1) count++;
	}
	if (row-1 >=0 && col+1 < cols) {  // cell to upper right
		if (grid[row-1][col+1] ==1) count++;
	}
	if (col-1 >= 0) {		// cell to the left
		if (grid[row][col-1] == 1) count++;
	}
	if (col+1 < cols) {      // cell to the right
		if (grid[row][col+1] == 1) count++;
	}
	if (row+1 < rows) {    	// cel below
		if (grid[row+1][col] == 1) count++;
	}
	if (row+1 < rows && col-1 >= 0) {   // lower left
		if (grid[row+1][col-1] == 1) count++;
	}
	if (row+1 < rows && col+1 < cols) {	// lower right
		if (grid[row+1][col+1] == 1) count++;
	}
	return count;
}



//start everything
window.onload = initialize;