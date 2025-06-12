var gameCanvas = document.getElementById("MineSweeper");
var ctx = gameCanvas.getContext('2d');
var menuStrip = document.getElementById("MenuStrip");
var widthTextField = document.getElementsByName("FieldWidth")[0];
var heightTextField = document.getElementsByName("FieldHeight")[0];
var bombTextField = document.getElementsByName("MineCount")[0];
var gameDiv = document.getElementById("GameContainer");
document.getElementById("ApplyButton").addEventListener('click', function (e) {
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
    menuStrip.style.height = "0px";
    menuStrip.style.visibility = "hidden";
    gameDiv.style.height = "".concat(fieldHeight * 21 + 8, "px");
    gameDiv.style.width = "".concat(fieldWidth * 21 + 8, "px");
    resizeInterval = setInterval(resizeGame, 100);
});
widthTextField.addEventListener('input', onInput, false);
heightTextField.addEventListener('input', onInput, false);
function onInput(ev) {
    var target = ev.target;
    if (parseInt(target.value) > 100)
        target.value = "100";
}
gameCanvas.addEventListener('mousedown', function (e) {
    if (!gameOver) {
        var clickedX = Math.floor(e.offsetX / (gameCanvas.width / fieldWidth));
        var clickedY = Math.floor(e.offsetY / (gameCanvas.height / fieldHeight));
        if (e.button === 0) {
            if (!field[clickedY][clickedX].flag) {
                if (field[clickedY][clickedX].content === -1) {
                    revealAll(field);
                    gameOver = true;
                    menuStrip.style.visibility = "visible";
                    menuStrip.style.height = "100%";
                }
                else {
                    field[clickedY][clickedX].reveal();
                }
            }
        }
        else {
            field[clickedY][clickedX].changeFlag();
        }
        won = isGameOver();
        if (won) {
            gameOver = true;
            menuStrip.style.visibility = "visible";
            menuStrip.style.height = "100%";
        }
    }
});
function generateField(x, y) {
    for (var i = 0; i < y; i++) {
        field.push(new Array());
        for (var j = 0; j < x; j++) {
            field[i].push(new FieldBox(j, i, CellContent.Empty, field));
        }
    }
}
function populateField(bombs) {
    for (var i = 0; i < bombs.length; i++) {
        field[bombs[i].yPos][bombs[i].xPos].content = -1;
    }
    for (var i = 0; i < field.length; i++) {
        for (var j = 0; j < field[i].length; j++) {
            if (field[i][j].content > -1) {
                for (var dY = -1; dY <= 1; dY++) {
                    for (var dX = -1; dX <= 1; dX++) {
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
function getEmpty(array) {
    var temp = [];
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            temp.push(new Point(j, i));
        }
    }
    return temp;
}
function getUnrevealed(array) {
    var temp = [];
    for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
            if (!array[i][j].revealed) {
                temp.push(new Point(j, i));
            }
        }
    }
    return temp;
}
function getBombsAsArray(nrOfBombs, empty) {
    var temp = [];
    for (var i = 0; i < nrOfBombs; i++) {
        var rand = Math.floor(Math.random() * empty.length);
        temp.push(empty[rand]);
        empty.splice(rand, 1);
    }
    return temp;
}
function arrayContainsPoint(array, point) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].xPos === point.xPos && array[i].yPos === point.yPos)
            return true;
    }
    return false;
}
function isGameOver() {
    var count = 0;
    for (var i = 0; i < field.length; i++) {
        for (var j = 0; j < field[i].length; j++) {
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
var fieldWidth = 21;
var fieldHeight = 21;
var bombsNR = 45;
var field = [];
var gameOver = false;
var won = false;
var reset = false;
var boxWidth = 21;
var boxHeight = 21;
var resizeInterval;
var CellContent;
(function (CellContent) {
    CellContent[CellContent["Empty"] = 0] = "Empty";
    CellContent[CellContent["Bomb"] = -1] = "Bomb";
})(CellContent || (CellContent = {}));
;
var Point = /** @class */ (function () {
    function Point(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
    return Point;
}());
var FieldBox = /** @class */ (function () {
    function FieldBox(xPos, yPos, content, field) {
        this.revealed = false;
        this.flag = false;
        this.xPos = xPos;
        this.yPos = yPos;
        this.content = content;
    }
    FieldBox.prototype.setContent = function (content) {
        this.content = content;
    };
    FieldBox.prototype.revealSingle = function () {
        this.revealed = true;
    };
    FieldBox.prototype.reveal = function () {
        this.revealed = true;
        if (this.content === 0) {
            this.revealAll();
        }
    };
    FieldBox.prototype.revealAll = function () {
        this.revealed = true;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (this.xPos + j >= 0 && this.xPos + j < field[0].length && this.yPos + i >= 0 && this.yPos + i < field.length) {
                    if (!(i === 0 && j === 0)) {
                        if (!field[this.yPos + i][this.xPos + j].revealed) {
                            if (field[this.yPos + i][this.xPos + j].content === 0) {
                                field[this.yPos + i][this.xPos + j].revealAll();
                            }
                            else {
                                if (field[this.yPos + i][this.xPos + j].content > 0) {
                                    field[this.yPos + i][this.xPos + j].revealSingle();
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    FieldBox.prototype.changeFlag = function () {
        if (this.flag) {
            this.flag = false;
        }
        else {
            this.flag = true;
        }
    };
    FieldBox.prototype.Flag = function () {
        this.flag = true;
    };
    FieldBox.prototype.draw = function (context, testWidth, testHeight) {
        var topLeft = new Point(this.xPos * testWidth, this.yPos * testHeight);
        if (this.revealed) {
            //Test
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            //
            context.fillStyle = 'white';
            context.fillRect(this.xPos * testWidth, this.yPos * testHeight, testWidth - 1, testHeight - 1);
            context.fillStyle = 'blue';
            context.font = '15px Arial';
            var textDimentions = context.measureText(this.content.toString());
            if (this.content > -1) {
                if (this.content > 0) {
                    //context.fillText(this.content.toString(), topLeft.xPos + (textDimentions.width), topLeft.yPos + parseInt(context.font) + 2);
                    context.fillText(this.content.toString(), topLeft.xPos + (textDimentions.width) + 2, topLeft.yPos + parseInt(context.font) - 3);
                }
            }
            else {
                var img = new Image;
                img.src = "./images/mine.png";
                context.drawImage(img, topLeft.xPos + 1, topLeft.yPos + 1, testWidth - 2, testHeight - 2);
            }
        }
        else {
            if (this.flag) {
                context.fillStyle = 'gray';
                context.fillRect(this.xPos * testWidth + 1, this.yPos * testHeight - 1, testWidth - 1, testHeight - 1);
                var img = new Image;
                img.src = "./images/flag.png";
                context.drawImage(img, topLeft.xPos + 1, topLeft.yPos + 0, testWidth - 2, testHeight - 3);
            }
            else {
                context.fillStyle = 'gray';
                context.fillRect(this.xPos * testWidth + 1, this.yPos * testHeight - 1, testWidth - 1, testHeight - 1);
            }
        }
    };
    return FieldBox;
}());
function revealAll(game) {
    for (var i = 0; i < game.length; i++) {
        for (var j = 0; j < game[i].length; j++) {
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
    gameCanvas.height = gameDiv.offsetHeight - 8;
    gameCanvas.width = gameDiv.offsetWidth - 8;
}
var testWidth = 21;
var testHeight = 21;
function draw() {
    if (reset) {
        menuStrip.style.visibility = "visible";
        menuStrip.style.height = "100%";
        reset = false;
    }
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    testWidth = Math.round(gameCanvas.width / fieldHeight);
    testHeight = Math.round(gameCanvas.height / fieldWidth);
    //Test
    ctx.fillStyle = 'white';
    for (var i = 0; i < fieldHeight; i++) {
        for (var j = 0; j < fieldWidth; j++) {
            field[i][j].draw(ctx, testWidth, testHeight);
        }
    }
    //
    if (gameOver) {
        if (won) {
            ctx.fillStyle = '#999999';
            ctx.font = "".concat(gameCanvas.width / 8, "px Arial");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("You Win", gameCanvas.width / 2, gameCanvas.height / 2);
        }
        else {
            ctx.fillStyle = '#999999';
            ctx.font = "".concat(gameCanvas.width / 8, "px Arial");
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Game Over", gameCanvas.width / 2, gameCanvas.height / 2);
        }
    }
    requestAnimationFrame(draw);
}
var aiStates = {
    "Unknown": -1,
    "KnownSafe": -2,
    "KnownBomb": -3
};
var v;
document.addEventListener('keydown', function (e) {
    if (e.which === 32 && !gameOver) {
        e.preventDefault();
        aiSweeper();
    }
});
var VisionBox = /** @class */ (function () {
    function VisionBox(xPos, yPos, revealed, content) {
        this.revealed = false;
        this.flagged = false;
        this.content = aiStates.Unknown;
        this.neighbours = [];
        this.xPos = xPos;
        this.yPos = yPos;
        this.revealed = revealed;
        this.content = content;
    }
    VisionBox.prototype.Flag = function () {
        this.flagged = true;
    };
    VisionBox.prototype.reveal = function () {
        this.revealed = true;
    };
    VisionBox.prototype.addNeighbour = function (neighbour) {
        if (!(neighbour.xPos === this.xPos && neighbour.yPos === this.yPos)) {
            this.neighbours.push(neighbour);
        }
    };
    VisionBox.prototype.getAdjBoxCount = function () {
        return this.neighbours.length;
    };
    VisionBox.prototype.getAdjFlagCount = function () {
        var count = 0;
        for (var i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].flagged) {
                count++;
            }
        }
        return count;
    };
    VisionBox.prototype.getUnrevealedNeighbours = function () {
        var temp = [];
        for (var i = 0; i < this.neighbours.length; i++) {
            if (!this.neighbours[i].revealed) {
                temp.push(this.neighbours[i]);
            }
        }
        return temp;
    };
    VisionBox.prototype.getPropEstimate = function () {
        if (this.revealed) {
            return -1;
        }
        else {
            var count = 0;
            for (var i = 0; i < this.neighbours.length; i++) {
                if (this.neighbours[i].revealed) {
                    count++;
                }
            }
            return count / this.neighbours.length;
        }
    };
    return VisionBox;
}());
//Test
function getProps(vision) {
    var t = [];
    for (var i = 0; i < vision.length; i++) {
        t.push([]);
        for (var j = 0; j < vision[i].length; j++) {
            t[i].push(vision[i][j].getPropEstimate());
        }
    }
    return t;
}
//
function aiSweeper() {
    var vision = [];
    var stuck = true;
    //Generate visible field
    for (var i = 0; i < field.length; i++) {
        vision.push([]);
        for (var j = 0; j < field[i].length; j++) {
            if (field[i][j].revealed) {
                vision[i].push(new VisionBox(j, i, true, field[i][j].content));
            }
            else {
                vision[i].push(new VisionBox(j, i, false, aiStates.Unknown));
            }
        }
    }
    for (var i = 0; i < vision.length; i++) {
        for (var j = 0; j < vision[i].length; j++) {
            for (var dY = -1; dY <= 1; dY++) {
                for (var dX = -1; dX <= 1; dX++) {
                    if (i + dY >= 0 && i + dY < vision.length && j + dX >= 0 && j + dX < vision[j].length) {
                        vision[i][j].addNeighbour(vision[i + dY][j + dX]);
                    }
                }
            }
        }
    }
    //
    for (var i = 0; i < vision.length; i++) {
        for (var j = 0; j < vision[i].length; j++) {
            var temp = vision[i][j].getUnrevealedNeighbours();
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
                    for (var iter = 0; iter < temp.length; iter++) {
                        //temp[iter].Flag();
                        vision[temp[iter].yPos][temp[iter].xPos].Flag();
                        field[temp[iter].yPos][temp[iter].xPos].Flag();
                    }
                }
            }
        }
    }
    for (var i = 0; i < vision.length; i++) {
        for (var j = 0; j < vision[i].length; j++) {
            if (vision[i][j].getAdjFlagCount() === vision[i][j].content) {
                var temp = vision[i][j].getUnrevealedNeighbours();
                for (var k = 0; k < temp.length; k++) {
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
        var possibleGuesses = [];
        for (var i = 0; i < vision.length; i++) {
            for (var j = 0; j < vision[i].length; j++) {
                if (!vision[i][j].flagged && !vision[i][j].revealed) {
                    possibleGuesses.push(vision[i][j]);
                }
            }
        }
        if (possibleGuesses.length > 0) {
            var guess = possibleGuesses[Math.floor(Math.random() * possibleGuesses.length)];
            field[guess.yPos][guess.xPos].reveal();
            //
            vision[guess.yPos][guess.xPos].reveal();
            if (field[guess.yPos][guess.xPos].content === CellContent.Bomb) {
                gameOver = true;
                reset = true;
            }
        }
        else {
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
