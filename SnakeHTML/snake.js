let canvas = document.getElementById('SnakeGame');
let ctx = canvas.getContext('2d');
let score = document.getElementById("score");
let gameDiv = document.getElementById('GameContainer');
let menuStrip = document.getElementById('MenuStrip');
let view = document.getElementById('view');
document.addEventListener('keydown', keyListener);
let applyButtpn = document.getElementById("ApplyButton");
let widthTextField = document.getElementsByName("FieldWidth")[0];
let heightTextField = document.getElementsByName("FieldHeight")[0];

//Button to apply changes
document.getElementById("ApplyButton").addEventListener('click', async (e) => {
    clearInterval(chromaID);
    if (parseInt(widthTextField.value) != NaN && parseInt(heightTextField.value) != NaN) {
        animate = false;
        fieldX = parseInt(widthTextField.value);
        fieldY = parseInt(heightTextField.value);
        //cancelAnimationFrame(animationRequestID);
        clearInterval(intervalID);
        await new Promise(r => setTimeout(r, 200));
        field = [];
        for (let i = 0; i < fieldY; i++) {
            field.push([]);
            for (let j = 0; j < fieldX; j++) {
                field[i].push(0);
            }
        }
        snake = new Snake(Math.floor(fieldX / 2), Math.floor(fieldY / 2));
        for (let i = 0; i < snake.body.length; i++) {
            field[snake.body[i].yPos][snake.body[i].xPos] = CellStates.SnakeBody;
        }
        generateFruit(getEmpty());
        console.log(field);
        console.log(snake);
        eaten = false;
        animate = true;
        gameOver = false;
        won = false;
        gameStart = false;
        direction = -1;
        moved = false;

        snakeBodyChroma = document.getElementsByName("SnakeBodyChroma")[0].checked;
        snakeHeadChroma = document.getElementsByName("SnakeHeadChroma")[0].checked;
        fruitChroma = document.getElementsByName("FruitChroma")[0].checked;
        emptyChroma = document.getElementsByName("EmptyChroma")[0].checked;

        console.log(snakeBodyChroma, snakeHeadChroma, fruitChroma, emptyChroma);
        if(snakeBodyChroma || snakeHeadChroma || fruitChroma || emptyChroma){
            chromaID = setInterval(chromaEffect, 500);
        }
        intervalID = setInterval(gameLoop, speed);
        draw();
    }
});

let testWidth = 21;
let testHeight = 21;
let scorePlayer = 0;
let speed = 300;
let steps = 1;
let startLength = 3;

let snakeBodyColor = '#00FF00';
let snakeHeadColor = '#006600';
let fruitColor = '#FF0000';
let colorEmpty = '#FFFFE6';

let gameOver = false;
let won = false;
let eaten = true;
let fieldX = 21;
let fieldY = 21;
let field = [];
let direction = -1;
let moved = false;
let gameStart = false;

let chromaID = 0;
let animationRequestID = 0;
let animate = true;

let snakeBodyChroma = false;
let snakeHeadChroma = false;
let fruitChroma = false;
let emptyChroma = false;

for (let i = 0; i < fieldY; i++) {
    field.push([]);
    for (let j = 0; j < fieldX; j++) {
        field[i].push(0);
    }
}

canvas.height = gameDiv.offsetHeight - 8;
canvas.width = gameDiv.offsetWidth - 8;
score.innerHTML = `Score ${scorePlayer}`;

const CellStates =
{
    'Empty': 0,
    'SnakeHead': 1,
    'SnakeBody': 2,
    'Fruit': 3
};

const Directions =
{
    'Notrh': 0,
    'East': 1,
    'South': 2,
    'West': 3
};

class Point {
    xPos;
    yPos;
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
}

class Fruit {
    xPos;
    yPos;
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
}

class Snake {
    xPos;
    yPos;
    body;
    constructor(headX, headY, body) {
        this.xPos = headX;
        this.yPos = headY;
        this.body = [];
        for (let i = 0; i < startLength; i++) {
            this.body.push(new Point(headX, headY));
        }
    }
    move(dX, dY) {
        if (this.xPos + dX < 0 || this.xPos + dX > field[0].length - 1 || this.yPos + dY < 0 || this.yPos + dY > field.length - 1) {
            //Clears last body part from field
            field[this.body[this.body.length - 1].yPos][this.body[this.body.length - 1].xPos] = 0;

            //Moves Body
            for (let i = this.body.length - 1; i > 0; i--) {
                this.body[i].xPos = this.body[i - 1].xPos;
                this.body[i].yPos = this.body[i - 1].yPos;
            }

            //Moves head
            if (this.xPos + dX > field[0].length - 1) {
                this.xPos = 0;
                this.body[0].xPos = 0;
            }
            else {
                if (this.xPos + dX < 0) {
                    this.xPos = field[0].length - 1;
                    this.body[0].xPos = field[0].length - 1;
                }
                else {
                    if (this.yPos + dY > field.length - 1) {
                        this.yPos = 0;
                        this.body[0].yPos = 0;
                    }
                    else {
                        if (this.yPos + dY < 0) {
                            this.yPos = field.length - 1;
                            this.body[0].yPos = field.length - 1;
                        }
                    }
                }
            }

            //eats fruit over border
            if (field[this.yPos][this.xPos] === CellStates.Fruit) {
                this.body.push(new Point(this.body[this.body.length - 1].xPos - dX, this.body[this.body.length - 1].yPos - dY));
                eaten = true;
            }
        }
        else {
            if (field[this.yPos + dY][this.xPos + dX] === 3) {
                this.body.push(new Point(this.body[this.body.length - 1].xPos, this.body[this.body.length - 1].yPos));
                eaten = true;
            }
            //Clear field for update
            for (let i = 0; i < this.body.length; i++) {
                field[this.body[i].yPos][this.body[i].xPos] = CellStates.Empty;
            }

            //Move Body
            for (let i = this.body.length - 1; i > 0; i--) {
                this.body[i].xPos = this.body[i - 1].xPos;
                this.body[i].yPos = this.body[i - 1].yPos;
            }
            this.body[0].xPos = this.xPos;
            this.body[0].yPos = this.yPos;
            this.xPos += dX;
            this.yPos += dY;
            this.body[0].xPos = this.xPos;
            this.body[0].yPos = this.yPos;
        }

        //Fill snake position
        for (let i = 0; i < this.body.length; i++) {
            if (i === 0) {
                field[this.body[i].yPos][this.body[i].xPos] = CellStates.SnakeHead;
            }
            else {
                field[this.body[i].yPos][this.body[i].xPos] = CellStates.SnakeBody;
            }
        }
    }
    isCollision() {
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].xPos === this.xPos && this.body[i].yPos === this.yPos) {
                return true;
            }
        }
        return false;
    }
}

function generateFruit(empty) {
    let point = empty[Math.floor(Math.random() * empty.length)];
    field[point.yPos][point.xPos] = CellStates.Fruit;
    if (empty.length === 0) {
        won = true;
    }
    return new Fruit(point.xPos, point.yPos);
}

function getEmpty() {
    let empty = [];
    for (let i = 0; i < fieldY; i++) {
        for (let j = 0; j < fieldX; j++) {
            if (field[i][j] === 0) {
                empty.push(new Point(j, i));
            }
        }
    }
    return empty;
}

draw();
let intervalID = setInterval(gameLoop, speed);
//let fruit = generateFruit(getEmpty());
//field[fruit.yPos][fruit.xPos] = CellStates.Fruit;
let snake = new Snake(Math.floor(fieldX / 2), Math.floor(fieldY / 2));
for (let i = 0; i < snake.body.length; i++) {
    field[snake.body[i].yPos][snake.body[i].xPos] = CellStates.SnakeBody;
}


function draw() {
    if (gameOver) {
        if (won) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = `${canvas.width / 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("You Win", canvas.width / 2, canvas.height / 2)
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = `${canvas.width / 8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2)
        }

    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        testWidth = canvas.width / field[0].length;
        testHeight = canvas.height / field.length;

        for (let i = 0; i < fieldY; i++) {
            for (let j = 0; j < fieldX; j++) {
                switch (field[i][j]) {
                    case CellStates.Empty:
                        ctx.fillStyle = colorEmpty;
                        ctx.fillRect(j * testWidth + 1, i * testHeight + 1, testWidth - 1, testHeight - 1);
                        break;
                    case CellStates.SnakeHead:
                        ctx.fillStyle = snakeHeadColor;
                        ctx.fillRect(j * testWidth + 1, i * testHeight + 1, testWidth - 1, testHeight - 1);
                        break;
                    case CellStates.SnakeBody:
                        ctx.fillStyle = snakeBodyColor;
                        ctx.fillRect(j * testWidth + 1, i * testHeight + 1, testWidth - 1, testHeight - 1);
                        break;
                    case CellStates.Fruit:
                        ctx.fillStyle = fruitColor;
                        ctx.fillRect(j * testWidth + 1, i * testHeight + 1, testWidth - 1, testHeight - 1);
                        break;
                }
            }
        }
    }
    if (animate) {
        animationRequestID = requestAnimationFrame(draw);
    }
}

function gameLoop() {
    canvas.height = gameDiv.offsetHeight - 8;
    canvas.width = gameDiv.offsetWidth - 8;
    score.innerHTML = `Score ${scorePlayer - 1}`;

    if (!gameOver) {
        if (eaten) {
            let emptyCells = getEmpty();
            if (emptyCells.length === 0) {
                gameOver = true;
            }
            else {
                generateFruit(emptyCells);
                eaten = false;
                scorePlayer++;
                if (speed > 50) {
                    speed -= 2;
                    clearInterval(intervalID);
                    intervalID = setInterval(gameLoop, speed);
                }
                animationRequestID = requestAnimationFrame(draw);
            }
        }

        switch (direction) {
            case Directions.Notrh:
                snake.move(0, -1);
                gameStart = true;
                break;
            case Directions.East:
                snake.move(1, 0);
                gameStart = true;
                break;
            case Directions.South:
                snake.move(0, 1);
                gameStart = true;
                break;
            case Directions.West:
                snake.move(-1, 0);
                gameStart = true;
                break;
        }
        moved = false;
        if (gameStart) {
            gameOver = snake.isCollision();
            menuStrip.style.height = 0;
            menuStrip.style.visibility = "hidden";
        } else {
            gameOver = false;
        }
    } else {
        //clearInterval(intervalID);
        menuStrip.style.visibility = "visible";
        menuStrip.style.height = "100%";
    }
}

function keyListener(e) {
    if (moved) {
        return;
    }
    switch (e.which) {
        case 37:
            if (direction != Directions.East) {
                //snake.move(-1, 0);
                direction = Directions.West
            }
            break;
        case 38:
            if (direction != Directions.South) {
                //snake.move(0, -1);
                direction = Directions.Notrh
            }
            break;
        case 39:
            if (direction != Directions.West) {
                //snake.move(1, 0);
                direction = Directions.East
            }
            break;
        case 40:
            if (direction != Directions.Notrh) {
                //snake.move(0, 1); 
                direction = Directions.South;
            }
            break;
    }
    moved = true;
    /*console.log(snake);
    console.log(field);*/
}

function chromaEffect(){
    if (snakeBodyChroma) {
        if(parseInt(snakeBodyColor.substring(1), 16) > 65535){
            snakeBodyColor = "#100"
        }else{
            snakeBodyColor = "#" + (parseInt(snakeBodyColor.substring(1), 16) + 2).toString(16);
            /*console.log(snakeBodyColor);
            console.log(parseInt(snakeBodyColor.substring(1), 16));*/
        }
    }
    if (snakeHeadChroma) {
        if(parseInt(snakeHeadColor.substring(1), 16) > 65535){
            snakeHeadColor = "#100"
        }else{
            snakeHeadColor = "#" + (parseInt(snakeHeadColor.substring(1), 16) + 2).toString(16);
            /*console.log(snakeHeadColor);
            console.log(parseInt(snakeHeadColor.substring(1), 16));*/
        }
    }
    if (fruitChroma) {
        if(parseInt(fruitColor.substring(1), 16) > 65535){
            fruitColor = "#100"
        }else{
            fruitColor = "#" + (parseInt(fruitColor.substring(1), 16) + 1).toString(16);
            /*console.log(fruitColor);
            console.log(parseInt(fruitColor.substring(1), 16));*/
        }
    }
    if (emptyChroma) {
        if(parseInt(colorEmpty.substring(1), 16) > 65535){
            colorEmpty = "#100"
        }else{
            colorEmpty = "#" + (parseInt(colorEmpty.substring(1), 16) + 2).toString(16);
            /*console.log(colorEmpty);
            console.log(parseInt(colorEmpty.substring(1), 16));*/
        }
    }
}