let canvas = document.getElementById("Tetris");
let nextPiece = document.getElementById("NextPiece");
let ctx = canvas.getContext("2d");
let ctxNextPiece = nextPiece.getContext("2d");
const field = [];
let paused = false;
let score = 0;
const btrestart = document.createElement("button");
btrestart.innerText = "Restart";
btrestart.addEventListener("click", () => {
	for (let i = 0; i < 21; i++) {
		field[i] = [];
		for (let j = 0; j < 9; j++) {
			field[i][j] = 0;
		}
	}

	let random = Math.floor(Math.random() * 7);
	active = new TetrisPiece(
		tetrominos[Object.keys(tetrominos)[random]],
		colors[Object.keys(tetrominos)[random]],
		3,
		0
	);
	gameover = false;
	btrestart.style.visibility = "hidden";
	score = 0;
});
document.body.appendChild(btrestart);
btrestart.style.visibility = "hidden";

//position NextPiece right of TetrisDiv
//document.getElementById('dontCare').style.marginRight = (window.screen.width-canvas.width-document.getElementById('NextPiece').width-35)+'px';
repositionNextBlock();
//document.getElementById('dontCare').style.marginRight = (document.body.clientWidth-canvas.width-document.getElementById('NextPiece').width-35)+'px';
//

//Versuch resize zu detecten
let shouldResize = false;
let div = document.getElementById("TetrisDiv");
let observer = new ResizeObserver((entries) => {
	for (let i = 0; i < entries.length; i++) {
		if (entries[i].target === div && shouldResize) {
			canvas.width = entries[i].contentRect.width;
			div.width = entries[i].contentRect.width + 2;
			canvas.height = entries[i].contentRect.height;
			div.height = entries[i].contentRect.height + 2;
			//Neuer Stein
			//document.getElementById('dontCare').style.marginRight = (window.screen.width-canvas.width-document.getElementById('NextPiece').width-35)+'px';
			//document.getElementById('dontCare').style.marginRight = (window.screen.width-canvas.width-ctx.measureText('Score: '+score).width-80)+'px';
			repositionNextBlock();
			//document.getElementById('dontCare').style.marginRight = (document.body.clientWidth-canvas.width-ctx.measureText('Score: '+score).width-80)+'px';
			//
			draw();
		}
	}
});
observer.observe(div);
document.addEventListener("mouseup", onMouseUP);
document.addEventListener("mousedown", onMouseDown);

function onMouseUP(e) {
	shouldResize = false;
}

function onMouseDown(e) {
	shouldResize = true;
}
//

//Versuch windowresize zu detecten
addEventListener("resize", (event) => {
	repositionNextBlock();
});
//

const tetrominos = {
	I: [
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
		[0, 0, 1, 0],
	],
	J: [
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
	L: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0],
	],
	O: [
		[1, 1],
		[1, 1],
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0],
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0],
	],
	T: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0],
	],
};

// color of each tetromino
const colors = {
	I: "cyan",
	O: "yellow",
	T: "purple",
	S: "green",
	Z: "red",
	J: "blue",
	L: "orange",
};

class Box {
	constructor(xPos, yPos, color) {
		this.xPos = xPos;
		this.yPos = yPos;
		this.color = color;
	}
}

class TetrisPiece {
	constructor(layout, color, xPos, yPos) {
		this.color = color;
		this.xPos = xPos;
		this.yPos = yPos;
		this.layout = layout;
		let boxes = [];
		this.boxes = boxes;
		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[i].length; j++) {
				if (layout[i][j]) {
					if (boxes === undefined) {
						boxes[0] = new Box(
							xPos + j /* + 17 * i*/,
							yPos + i /* + 17 * j*/,
							color
						);
					} else {
						boxes[boxes.length] = new Box(
							xPos + j /* + 17 * i*/,
							yPos + i /* + 17 * j*/,
							color
						);
					}
				}
			}
		}
	}
}

function repositionNextBlock() {
	if (
		ctx.measureText("Score: " + score).width >
		document.getElementById("NextPiece").width
	) {
		document.getElementById("dontCare").style.marginRight =
			document.body.clientWidth -
			canvas.width -
			ctx.measureText("Score: " + score).width -
			35 +
			"px";
	} else {
		document.getElementById("dontCare").style.marginRight =
			document.body.clientWidth - canvas.width - nextPiece.width - 35 + "px";
	}
}

function isContained(xPos, yPos) {
	if (xPos < 0 || yPos < 0 || xPos > 8 || yPos > 20) {
		return false;
	}
	return true;
}

function rotate(blockLayout) {
	let rotatedLayout = [[]];

	for (let i = 0; i < blockLayout.length; i++) {
		rotatedLayout[i] = [];
		for (let j = 0; j < blockLayout[i].length; j++) {
			rotatedLayout[i][j] = 0;
		}
	}
	let temp = [];
	let column = 0;
	for (let i = blockLayout.length - 1; i >= 0; i--) {
		for (let j = 0; j < blockLayout[i].length; j++) {
			temp[j] = blockLayout[i][j];
		}

		for (let k = 0; k < temp.length; k++) {
			rotatedLayout[k][column] = temp[k];
		}
		column++;
	}
	return rotatedLayout;
}

function canRotate() {
	let testRotation = rotate(active.layout);
	let brotate = true;

	for (let i = 0; i < testRotation.length; i++) {
		for (let j = 0; j < testRotation[i].length; j++) {
			if (testRotation[i][j] === 1) {
				if (
					!isContained(active.xPos + j, active.yPos + i) ||
					field[active.yPos + i][active.xPos + j] !== 0
				) {
					brotate = false;
				}
			}
		}
	}
	return brotate;
}

let boxes = [new TetrisPiece(tetrominos.I, colors.I, 1, 0)];

for (let i = 0; i < 21; i++) {
	field[i] = [];
	for (let j = 0; j < 9; j++) {
		field[i][j] = 0;
	}
}

let active = new TetrisPiece(tetrominos.I, colors.I, 3, 0);
let random = Math.floor(Math.random() * 7);
active = new TetrisPiece(
	tetrominos[Object.keys(tetrominos)[random]],
	colors[Object.keys(tetrominos)[random]],
	3,
	0
);
let gameover = false;

setInterval(gameLoop, 300);
document.addEventListener("keydown", keyListener);
//
random = Math.floor(Math.random() * 7);
let next = new TetrisPiece(
	tetrominos[Object.keys(tetrominos)[random]],
	colors[Object.keys(tetrominos)[random]],
	3,
	0
);
//
draw();

//console.log(boxes[0].color);
//console.log(boxes[0].xPos);
//console.log(boxes[0].yPos);
//console.log(active.layout);
//console.log(active.boxes);

function isValid(box, dxPos, dyPos) {
	if (isContained(box.xPos + dxPos, box.yPos + dyPos)) {
		if (field[box.yPos + dyPos][box.xPos + dxPos] === 0) {
			return true;
		}
	}
	return false;
}

function placeAndGenerate() {
	//const blockTypes = Object.keys(tetrominos);
	for (let i = 0; i < active.boxes.length; i++) {
		field[active.boxes[i].yPos][active.boxes[i].xPos] = active.boxes[i];
	}

	let random = Math.floor(Math.random() * 7);
	active = next;
	//active = new TetrisPiece(tetrominos[Object.keys(tetrominos)[random]], colors[Object.keys(tetrominos)[random]], 3, 0);
	next = new TetrisPiece(
		tetrominos[Object.keys(tetrominos)[random]],
		colors[Object.keys(tetrominos)[random]],
		3,
		0
	);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctxNextPiece.clearRect(0, 0, nextPiece.width, nextPiece.height);
	//ctx.fillStyle = 'white';
	//ctx.fillRect(1, 1 ,20, 20);
	/*for(let i = 0; i < active.length; i++)
				{
					ctx.fillStyle = active[i].color;
					ctx.fillRect(active[i].xPos * 17 + 1, active[i].yPos * 17 + 1, 17, 17);
					//console.log(isContained(boxes[i].xPos, boxes[i].yPos));
				}*/

	//Resize boxes
	let boxWidth = Math.floor(canvas.width / 9);
	let boxHeight = Math.floor(canvas.height / 21);

	if (!gameover) {
		for (let i = 0; i < active.boxes.length; i++) {
			ctx.fillStyle = active.color;
			//original ctx.fillRect(active.boxes[i].xPos * 17 + 1, active.boxes[i].yPos * 17 + 1, 17 - 1, 17 - 1);
			ctx.fillRect(
				active.boxes[i].xPos * boxWidth + 1,
				active.boxes[i].yPos * boxHeight + 1,
				boxWidth - 1,
				boxHeight - 1
			);
		}

		for (let i = 0; i < 21; i++) {
			for (let j = 0; j < 9; j++) {
				if (field[i][j] !== 0) {
					ctx.fillStyle = field[i][j].color;
					//original ctx.fillRect(field[i][j].xPos * 17 + 1, field[i][j].yPos * 17 + 1, 17 - 1, 17 - 1);
					ctx.fillRect(
						field[i][j].xPos * boxWidth + 1,
						field[i][j].yPos * boxHeight + 1,
						boxWidth - 1,
						boxHeight - 1
					);
				}
			}
		}
		ctx.fillStyle = "white";
		ctx.font = "20px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		//original ctx.fillText('Score:'+score, 18 , canvas.height - 10);
		//ctx.fillText('Score:'+score, canvas.width - 100 , 10);
		document.getElementById("Score").innerHTML = "Score: " + score;
		document.getElementById("Score").style.color = "white";
		document.getElementById("Score").style.fontFamily = "comic sans ms";
	} else {
		ctx.fillStyle = "white";
		ctx.font = "28px monospace";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
	}

	//draw NextPiece in center
	if (next.layout.length === 4) {
		for (let i = 0; i < next.layout.length; i++) {
			for (let j = 0; j < next.layout[i].length; j++) {
				if (next.layout[i][j] === 1) {
					ctxNextPiece.fillStyle = next.color;
					ctxNextPiece.fillRect(j * 20 - 10, i * 20 + 1, 19, 19);
				}
			}
		}
	} else {
		if (next.layout.length === 3) {
			for (let i = 0; i < next.layout.length; i++) {
				for (let j = 0; j < next.layout[i].length; j++) {
					if (next.layout[i][j] === 1) {
						ctxNextPiece.fillStyle = next.color;
						ctxNextPiece.fillRect((j + 1) * 20 - 10, (i + 1) * 20 + 1, 19, 19);
					}
				}
			}
		} else {
			for (let i = 0; i < next.layout.length; i++) {
				for (let j = 0; j < next.layout[i].length; j++) {
					if (next.layout[i][j] === 1) {
						ctxNextPiece.fillStyle = next.color;
						ctxNextPiece.fillRect((j + 1) * 20, (i + 1) * 20, 19, 19);
					}
				}
			}
		}
	}
	//

	requestAnimationFrame(draw);
}

//let paused = false;

function gameLoop() {
	if (gameover) {
		btrestart.style.visibility = "visible";
		/*ctx.font = "30px Arial";
					ctx.fillStyle = "white";
					ctx.fillText("Game Over", 10, 50);*/
	} else {
		let canFall = true;
		for (let i = 0; i < active.boxes.length; i++) {
			if (isValid(active.boxes[i], 0, 1) && canFall) {
				canFall = true;
			} else {
				canFall = false;
			}
		}
		if (!paused) {
			if (canFall) {
				active.yPos++;
				for (let i = 0; i < active.boxes.length; i++) {
					active.boxes[i].yPos++;
				}
			} else {
				placeAndGenerate();
			}
		}
		//Check for overlapping boxes = gameover

		for (let i = 0; i < active.boxes.length; i++) {
			if (field[active.boxes[i].yPos][active.boxes[i].xPos] !== 0) {
				gameover = true;
			}
		}

		let fullRows = [];
		for (let i = 0; i < field.length; i++) {
			fullRows[i] = 0;
		}
		//Check for full Rows
		for (let i = 0; i < field.length; i++) {
			let counter = 0;
			for (let j = 0; j < field[i].length; j++) {
				if (field[i][j] !== 0) {
					counter++;
				}
			}
			if (counter === 9) {
				fullRows[i] = 1;
			}
		}
		let count = 0;

		for (let i = 0; i < fullRows.length; i++) {
			if (fullRows[i] === 1) {
				count++;
				for (let k = i; k >= 0; k--) {
					for (let j = 0; j < field[i].length; j++) {
						if (k === 0) {
							field[k][j] = 0;
						} else {
							field[k][j] = field[k - 1][j];
							field[k - 1][j].yPos++;
						}
					}
				}
			}
		}

		if (count == 1) {
			score += 40;
			document.getElementById("dontCare").style.marginRight =
				document.body.clientWidth -
				canvas.width -
				ctx.measureText("Score: " + score).width -
				35 +
				"px";
		} else if (count == 2) {
			score += 100;
			document.getElementById("dontCare").style.marginRight =
				document.body.clientWidth -
				canvas.width -
				ctx.measureText("Score: " + score).width -
				35 +
				"px";
		} else if (count == 3) {
			score += 300;
			document.getElementById("dontCare").style.marginRight =
				document.body.clientWidth -
				canvas.width -
				ctx.measureText("Score: " + score).width -
				35 +
				"px";
		} else if (count == 4) {
			score += 1200;
			document.getElementById("dontCare").style.marginRight =
				/*window.screen.width*/ document.body.clientWidth -
				canvas.width -
				ctx.measureText("Score: " + score).width -
				35 +
				"px";
		}
	}
}

function keyListener(e) {
	if (gameover) {
		return;
	}
	if (!paused) {
		if (e.which === 37) {
			active.xPos--;
			let valid = true;
			for (let i = 0; i < active.boxes.length; i++) {
				if (!(isValid(active.boxes[i], -1, 0) && valid)) {
					valid = false;
				}
			}
			if (valid) {
				for (let i = 0; i < active.boxes.length; i++) {
					active.boxes[i].xPos--;
				}
			}
		}
		if (e.which === 38) {
			if (canRotate()) {
				active.layout = rotate(active.layout);
				let boxNR = 0;
				for (let i = 0; i < active.layout.length; i++) {
					for (let j = 0; j < active.layout[i].length; j++) {
						if (active.layout[i][j] === 1) {
							active.boxes[boxNR].xPos = active.xPos + j;
							active.boxes[boxNR].yPos = active.yPos + i;
							boxNR++;
						}
					}
				}
			}
			//console.log(isContained(active.xPos, active.yPos));
		}
		if (e.which === 39) {
			active.xPos++;
			let valid = true;
			for (let i = 0; i < active.boxes.length; i++) {
				if (!(isValid(active.boxes[i], 1, 0) && valid)) {
					valid = false;
				}
			}
			if (valid) {
				for (let i = 0; i < active.boxes.length; i++) {
					active.boxes[i].xPos++;
				}
			}
		}
		if (e.which === 40) {
			active.yPos++;
			let valid = true;
			for (let i = 0; i < active.boxes.length; i++) {
				if (!(isValid(active.boxes[i], 0, 1) && valid)) {
					valid = false;
				}
			}
			if (valid) {
				for (let i = 0; i < active.boxes.length; i++) {
					active.boxes[i].yPos++;
				}
			}
		}
	}
	if (e.which === 32) {
		if (paused) {
			paused = false;
		} else {
			paused = true;
		}
		/*for(let i = 0; i < active.boxes.length; i++)
					{
						field[active.boxes[i].yPos][active.boxes[i].xPos] = active.boxes[i];
					}
					active = new TetrisPiece(tetrominos.T,colors.T, 3, 0);*/
	}
}
