const gameCanvas: any = document.getElementById("MineSweeper");
const ctx = gameCanvas.getContext('2d');
const menuStrip = document.getElementById("MenuStrip");
const widthTextField = document.getElementsByName("FieldWidth")[0] as HTMLInputElement;
const heightTextField = document.getElementsByName("FieldHeight")[0] as HTMLInputElement;
const bombTextField = document.getElementsByName("MineCount")[0] as HTMLInputElement;
const gameDiv = document.getElementById("GameContainer");

document.getElementById("ApplyButton")!.addEventListener('click', (e) => {
    resetGame();
    fieldWidth = parseInt(widthTextField.value);
    fieldHeight = parseInt(heightTextField.value);
    bombsNR = parseInt(bombTextField.value);

    if (fieldHeight <= 0)
        fieldHeight = 1;
    if (fieldHeight > 100)
        fieldHeight = 100;
    if (fieldWidth > 100)
        fieldWidth = 100;
    if (fieldWidth <= 0)
        fieldWidth = 1;
    if (bombsNR >= fieldWidth * fieldHeight)
        bombsNR = fieldWidth * fieldHeight - 1;
    if (bombsNR < 0)
        bombsNR = 0;

    generateField(fieldWidth, fieldHeight);
    populateField(getBombsAsArray(bombsNR, getEmpty(field)));
    draw();
    menuStrip!.style.height = "0px";
    menuStrip!.style.visibility = "hidden";

    gameDiv!.style.height = `${fieldHeight * 21 + 8}px`;
    gameDiv!.style.width = `${fieldWidth * 21 + 8}px`
    resizeInterval = setInterval(resizeGame, 100);
});

widthTextField.addEventListener('input', onInput, false);
heightTextField.addEventListener('input', onInput, false);

function onInput(this: HTMLInputElement, ev: Event): any {
    let target = ev.target as HTMLInputElement;
    if (parseInt(target!.value) > 100)
        target!.value = "100";
}

gameCanvas.addEventListener('mousedown', (e: MouseEvent) => {
    if (!gameOver) {
        let clickedX = Math.floor(e.offsetX / (gameCanvas.width / fieldWidth));
        let clickedY = Math.floor(e.offsetY / (gameCanvas.height / fieldHeight));

        if (e.button === 0) {
            if (!field[clickedY][clickedX].flag) {
                if (field[clickedY][clickedX].content === -1) {
                    revealAll(field);
                    gameOver = true;
                    menuStrip!.style.visibility = "visible";
                    menuStrip!.style.height = "100%";
                } else {
                    field[clickedY][clickedX].reveal();
                }
            }
        } else {
            field[clickedY][clickedX].changeFlag();
        }
        won = isGameOver();
        if (won) {
            gameOver = true;
            menuStrip!.style.visibility = "visible";
            menuStrip!.style.height = "100%";
        }
    }
});

function generateField(x: number, y: number) {
    for (let i = 0; i < y; i++) {
        field.push(new Array<FieldBox>());
        for (let j = 0; j < x; j++) {
            field[i].push(new FieldBox(j, i, CellContent.Empty, field));
        }
    }
}

function populateField(bombs: Point[]) {
    for (let i = 0; i < bombs.length; i++) {
        field[bombs[i].yPos][bombs[i].xPos].content = -1;
    }
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].content > -1) {
                for (let dY = -1; dY <= 1; dY++) {
                    for (let dX = -1; dX <= 1; dX++) {
                        if (i + dY >= 0 && j + dX >= 0 && i + dY < field.length && j + dX < field[0].length) {
                            if (field[i + dY][j + dX].content === -1) {
                                field[i][j].content++;
                            }
                        }
                    }
                }
            }
        }
    }
}

function getEmpty(array: Array<Array<FieldBox>>): Point[] {
    let temp: Point[] = [];
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            temp.push(new Point(j, i));
        }
    }
    return temp;
}

function getUnrevealed(array: Array<Array<FieldBox>>): Point[] {
    let temp: Point[] = [];
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (!array[i][j].revealed) {
                temp.push(new Point(j, i));
            }
        }
    }
    return temp;
}

function getBombsAsArray(nrOfBombs: number, empty: Point[]): Point[] {
    let temp: Point[] = [];
    for (let i = 0; i < nrOfBombs; i++) {
        let rand = Math.floor(Math.random() * empty.length);
        temp.push(empty[rand]);
        empty.splice(rand, 1);
    }
    return temp;
}

function arrayContainsPoint(array: Point[], point: Point): boolean {
    for (let i = 0; i < array.length; i++) {
        if (array[i].xPos === point.xPos && array[i].yPos === point.yPos)
            return true;
    }
    return false;
}

function isGameOver(): boolean {
    let count: number = 0;
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].content === -1) {
                count++;
            }
        }
    }
    if (getUnrevealed(field).length === count) {
        return true;
    }
    return false;
}

let fieldWidth: number = 21;
let fieldHeight: number = 21;
let bombsNR: number = 45;
let field: Array<Array<FieldBox>> = [];
let gameOver = false;
let won = false;
let reset = false;

let boxWidth: number = 21;
let boxHeight: number = 21;
var resizeInterval;

enum CellContent {
    "Empty" = 0,
    "Bomb" = -1
};

class Point {
    xPos: number;
    yPos: number;
    constructor(xPos: number, yPos: number) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
}

class FieldBox {
    xPos: number;
    yPos: number;
    content: number;
    revealed: boolean = false;
    flag: boolean = false;
    constructor(xPos: number, yPos: number, content: number, field: FieldBox[][]) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.content = content;
    }

    public setContent(content: number) {
        this.content = content;
    }

    public revealSingle() {
        this.revealed = true;
    }

    public reveal() {
        this.revealed = true;
        if (this.content === 0) {
            this.revealAll();
        }
    }

    public revealAll() {
        this.revealed = true;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (this.xPos + j >= 0 && this.xPos + j < field[0].length && this.yPos + i >= 0 && this.yPos + i < field.length) {
                    if (!(i === 0 && j === 0)) {
                        if (!field[this.yPos + i][this.xPos + j].revealed) {
                            if (field[this.yPos + i][this.xPos + j].content === 0) {
                                field[this.yPos + i][this.xPos + j].revealAll();
                            } else {
                                if (field[this.yPos + i][this.xPos + j].content > 0) {
                                    field[this.yPos + i][this.xPos + j].revealSingle();
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    public changeFlag() {
        if (this.flag) {
            this.flag = false;
        } else {
            this.flag = true;
        }
    }

    public Flag() {
        this.flag = true;
    }

    public draw(context: CanvasRenderingContext2D, testWidth: number, testHeight: number) {
        let topLeft = new Point(this.xPos * testWidth, this.yPos * testHeight);
        if (this.revealed) {

            //Test
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            //

            context.fillStyle = 'white';
            context.fillRect(this.xPos * testWidth, this.yPos * testHeight, testWidth - 1, testHeight - 1);
            context.fillStyle = 'blue';
            context.font = '15px Arial';
            let textDimentions = context.measureText(this.content.toString());
            if (this.content > -1) {
                if (this.content > 0) {
                    //context.fillText(this.content.toString(), topLeft.xPos + (textDimentions.width), topLeft.yPos + parseInt(context.font) + 2);
                    context.fillText(this.content.toString(), topLeft.xPos + (textDimentions.width) + 2, topLeft.yPos + parseInt(context.font) - 3);
                }
            } else {
                let img = new Image;
                img.src = "./images/mine.png";
                context.drawImage(img, topLeft.xPos + 1, topLeft.yPos + 1, testWidth - 2, testHeight - 2);
            }
        } else {
            if (this.flag) {
                context.fillStyle = 'gray';
                context.fillRect(this.xPos * testWidth + 1, this.yPos * testHeight - 1, testWidth - 1, testHeight - 1);
                let img = new Image;
                img.src = "./images/flag.png";
                context.drawImage(img, topLeft.xPos + 1, topLeft.yPos + 0, testWidth - 2, testHeight - 3);
            } else {
                context.fillStyle = 'gray';
                context.fillRect(this.xPos * testWidth + 1, this.yPos * testHeight - 1, testWidth - 1, testHeight - 1);
            }
        }
    }

}

function revealAll(game: Array<Array<FieldBox>>) {
    for (let i = 0; i < game.length; i++) {
        for (let j = 0; j < game[i].length; j++) {
            game[i][j].reveal();
        }
    }
}

function resetGame() {
    fieldWidth = 21;
    fieldHeight = 21;
    bombsNR = 45;
    field = [];
    boxWidth = 21;
    boxHeight = 21;
    gameOver = false;
    won = false;
}

function resizeGame() {
    gameCanvas.height = gameDiv!.offsetHeight - 8;
    gameCanvas.width = gameDiv!.offsetWidth - 8;
}
let testWidth = 21;
let testHeight = 21;

function draw() {
    if (reset) {
        menuStrip!.style.visibility = "visible";
        menuStrip!.style.height = "100%";
        reset = false;
    }
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    testWidth = Math.round(gameCanvas.width / fieldHeight);
    testHeight = Math.round(gameCanvas.height / fieldWidth);
    //Test
    ctx.fillStyle = 'white';
    for (let i = 0; i < fieldHeight; i++) {
        for (let j = 0; j < fieldWidth; j++) {
            field[i][j].draw(ctx, testWidth, testHeight);
        }
    }
    //
    if (gameOver) {
        if (won) {
            ctx.fillStyle = '#999999';
            ctx.font = `${gameCanvas.width / 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("You Win", gameCanvas.width / 2, gameCanvas.height / 2)
        } else {
            ctx.fillStyle = '#999999';
            ctx.font = `${gameCanvas.width / 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Game Over", gameCanvas.width / 2, gameCanvas.height / 2)
        }
    }

    requestAnimationFrame(draw);
}

let aiStates = {
    "Unknown": -1,
    "KnownSafe": -2,
    "KnownBomb": -3
};

let v: VisionBox[][];
document.addEventListener('keydown', (e) => {
    if (e.which === 32 && !gameOver) {
        e.preventDefault();
        aiSweeper();
    }
});

class VisionBox {
    xPos: number;
    yPos: number;
    revealed: boolean = false;
    flagged: boolean = false;
    content: number = aiStates.Unknown;
    neighbours: VisionBox[] = [];
    constructor(xPos: number, yPos: number, revealed: boolean, content: number) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.revealed = revealed;
        this.content = content;
    }

    public Flag() {
        this.flagged = true;
    }

    public reveal() {
        this.revealed = true;
    }

    public addNeighbour(neighbour: VisionBox) {
        if (!(neighbour.xPos === this.xPos && neighbour.yPos === this.yPos)) {
            this.neighbours.push(neighbour);
        }

    }

    public getAdjBoxCount(): number {
        return this.neighbours.length;
    }

    public getAdjFlagCount(): number {
        let count = 0;
        for (let i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].flagged) {
                count++;
            }
        }
        return count;
    }

    public getUnrevealedNeighbours(): VisionBox[] {
        let temp: VisionBox[] = [];
        for (let i = 0; i < this.neighbours.length; i++) {
            if (!this.neighbours[i].revealed) {
                temp.push(this.neighbours[i]);
            }
        }
        return temp;
    }

    public getPropEstimate(): number {
        if (this.revealed) {
            return -1;
        } else {
            let count = 0;
            for (let i = 0; i < this.neighbours.length; i++) {
                if (this.neighbours[i].revealed) {
                    count++;
                }
            }
            return count / this.neighbours.length;
        }
    }
}

//Test
function getProps(vision: VisionBox[][]): number[][] {
    let t: number[][] = [];
    for (let i = 0; i < vision.length; i++) {
        t.push([]);
        for (let j = 0; j < vision[i].length; j++) {
            t[i].push(vision[i][j].getPropEstimate());
        }
    }
    return t;
}
//

function aiSweeper() {
    let vision: VisionBox[][] = [];
    let stuck = true;

    //Generate visible field
    for (let i = 0; i < field.length; i++) {
        vision.push([]);
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].revealed) {
                vision[i].push(new VisionBox(j, i, true, field[i][j].content));
            } else {
                vision[i].push(new VisionBox(j, i, false, aiStates.Unknown));
            }
        }
    }
    for (let i = 0; i < vision.length; i++) {
        for (let j = 0; j < vision[i].length; j++) {
            for (let dY = -1; dY <= 1; dY++) {
                for (let dX = -1; dX <= 1; dX++) {
                    if (i + dY >= 0 && i + dY < vision.length && j + dX >= 0 && j + dX < vision[j].length) {
                        vision[i][j].addNeighbour(vision[i + dY][j + dX]);
                    }
                }
            }
        }
    }
    //

    for (let i = 0; i < vision.length; i++) {
        for (let j = 0; j < vision[i].length; j++) {
            let temp = vision[i][j].getUnrevealedNeighbours();
            //Flag standalone unevealed fields
            if (vision[i][j].getUnrevealedNeighbours().length === 0 && vision[i][j].content === -1) {
                field[i][j].Flag();
                vision[i][j].Flag();
            }
            //Flag unrevealed with a one on the corner which has no unrevealed neighbours
            if (vision[i][j].content === 1) {
                if (temp.length === 1) {
                    field[temp[0].yPos][temp[0].xPos].Flag();
                    vision[temp[0].yPos][temp[0].xPos].Flag();
                }
            }
            //Flag numbers > 1 with only bombs remaining unrevealed
            if (vision[i][j].content > 1) {
                if (temp.length === vision[i][j].content) {
                    for (let iter = 0; iter < temp.length; iter++) {
                        //temp[iter].Flag();
                        vision[temp[iter].yPos][temp[iter].xPos].Flag();
                        field[temp[iter].yPos][temp[iter].xPos].Flag();
                    }
                }
            }
        }
    }

    for (let i = 0; i < vision.length; i++) {
        for (let j = 0; j < vision[i].length; j++) {
            if (vision[i][j].getAdjFlagCount() === vision[i][j].content) {
                let temp = vision[i][j].getUnrevealedNeighbours();
                for (let k = 0; k < temp.length; k++) {
                    if (!temp[k].flagged) {
                        //
                        vision[temp[k].yPos][temp[k].xPos].reveal();
                        field[temp[k].yPos][temp[k].xPos].reveal();
                        stuck = false;
                    }
                }
            }
        }
    }

    console.log("TOTO: Implement guessing based on chance");

    if (stuck) {
        console.log("pre");
        console.log(getProps(vision));
        let possibleGuesses: VisionBox[] = [];
        for (let i = 0; i < vision.length; i++) {
            for (let j = 0; j < vision[i].length; j++) {
                if (!vision[i][j].flagged && !vision[i][j].revealed) {
                    possibleGuesses.push(vision[i][j]);
                }
            }
        }

        if (possibleGuesses.length > 0) {
            let guess: VisionBox = possibleGuesses[Math.floor(Math.random() * possibleGuesses.length)];
            field[guess.yPos][guess.xPos].reveal();
            //
            vision[guess.yPos][guess.xPos].reveal();
            if (field[guess.yPos][guess.xPos].content === CellContent.Bomb) {
                gameOver = true;
                reset = true;
            }
        } else {
            gameOver = true;
            won = true;
            reset = true;
        }
        console.log(possibleGuesses);
    }

    console.log("post");
    console.log(getProps(vision));

    //console.log(stuck);
    //console.log(vision);

}