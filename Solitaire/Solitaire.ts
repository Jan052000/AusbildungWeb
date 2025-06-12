const gameDiv = document.getElementById("GameDiv");
const gameCanvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
const ctx = gameCanvas.getContext('2d') as CanvasRenderingContext2D;
const view = document.getElementById("view");
gameCanvas.oncontextmenu = (e) => { e.preventDefault(); ClickListener(e) };

gameCanvas.addEventListener("click", ClickListener);
gameCanvas.addEventListener("mousemove", MoveListener);

const DeckImage = new Image();
DeckImage.src = "images/Card Deck.jpg";
const cardWidth = 69;
const cardHeight = 101;
const cardDrawWidth = cardWidth;//69;
const cardDrawHeight = cardHeight;//101;
const dashes: number[] = [11];
let won: boolean = false;

const Types = {
    "Clover": 0,
    "Diamonds": 1,
    "Hearts": 2,
    "Spades": 3,
    "Special": 4
}

const Values = {
    "Ace": 0,
    "Two": 1,
    "Three": 2,
    "Four": 3,
    "Five": 4,
    "Six": 5,
    "Seven": 6,
    "Eight": 7,
    "Nine": 8,
    "Ten": 9,
    "Jack": 10,
    "Queen": 11,
    "King": 12,
    "Back": 2
}

class Card {
    xPos: number;
    yPos: number;
    cardValue: number;
    cardType: number;
    flipped: boolean;
    available: boolean;
    isBack: boolean;
    xPosOld: number;
    yPosOld: number;
    constructor(xPos: number, yPos: number, type: number, cardType: number, flipped: boolean, available: boolean, isBack: boolean = false) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.cardValue = type;
        this.cardType = cardType;
        this.flipped = flipped;
        this.available = available;
        this.isBack = isBack;
        this.xPosOld = xPos;
        this.yPosOld = yPos;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.flipped) {
            ctx.drawImage(DeckImage, cardWidth * this.cardValue + Math.round(this.cardValue / 14), cardHeight * this.cardType - this.cardType + Math.floor(this.cardType / 4), cardWidth, cardHeight, this.xPos, this.yPos, cardDrawWidth, cardDrawHeight);
        } else {
            ctx.drawImage(DeckImage, cardWidth * Values.Back + Math.round(Values.Back / 14), cardHeight * Types.Special - Types.Special + Math.floor(Types.Special / 4), cardWidth, cardHeight, this.xPos, this.yPos, cardDrawWidth, cardDrawHeight);
        }
    }

    reveal() {
        this.flipped = true;
    }

    deal() {
        this.available = false;
    }

    jump(xPos: number, yPos: number) {
        this.xPos = xPos;
        this.yPos = yPos;
    }

    initialMove(xPos: number, yPos: number) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.xPosOld = xPos;
        this.yPosOld = yPos;
    }

    stack(xPos: number, yPos: number) {
        this.xPos = xPos;
        this.xPosOld = xPos;
        this.yPos = yPos;
        this.yPosOld = yPos;
    }

    //2023
    getStockNr(): number {
        return Math.floor(this.xPosOld / (cardWidth + 7.5)) - 2;
    }
    getDeltNr(): number {
        return Math.floor((this.xPosOld - Back.xPos - 2.5) / (cardWidth + 7.5));
    }
}

class CardTypes {
    cards: Card[];
    cardType: number;
    constructor(cardType: number) {
        this.cards = this.initCards(cardType);
        this.cardType = cardType;
    }

    initCards(type: number): Card[] {
        let t: Card[] = []
        for (let i = 0; i < 13; i++) {
            t.push(new Card(0, 0, i, type, false, true));
        }
        return t;
    }
}

class DeckClass {
    clovers: CardTypes;
    diamonds: CardTypes;
    hearts: CardTypes;
    spades: CardTypes;
    constructor() {
        this.clovers = new CardTypes(Types.Clover);
        this.diamonds = new CardTypes(Types.Diamonds);
        this.hearts = new CardTypes(Types.Hearts);
        this.spades = new CardTypes(Types.Spades);
    }

    getAvailable(): Card[] {
        let cards: Card[] = [];
        let fields: CardTypes[] = [this.clovers, this.diamonds, this.hearts, this.spades]
        for (let i = 0; i < fields.length; i++) {
            for (let j = 0; j < fields[i].cards.length; j++) {
                if (fields[i].cards[j].available) {
                    cards.push(fields[i].cards[j]);
                }
            }
        }
        return cards;
    }
}

class Stack {
    next: number;
    topCard: Card | undefined;
    constructor() {
        this.next = 0;
    }

    put(card: Card) {
        this.topCard = card;
        //2023
        this.topCard.jump(Back.xPos + 297 + this.topCard.cardType * cardWidth + this.topCard.cardType * 5, Back.yPos);
        this.next++;
    }
}

const Back = new Card(51, 10, Values.Back, Types.Special, true, true, true);

//Game Variables
let Stacks: Stack[];
let Stocks: Array<Array<Card>> = [];
let Delt: Card[] = [];
let Flipped: Card[] = [];
let Deck: DeckClass = new DeckClass();
let deckDeltCount = 0;
let reshuffle = false;
//let picked: Card | undefined;
let picked: Card[] = [];
let pickedUp = false;
let fromDelt = false;

initGame();
draw();

function initGame() {
    Deck = new DeckClass();
    Stacks = [];
    for (let i = 0; i < 4; i++) {
        Stacks.push(new Stack());
    }
    Stocks = [];
    Delt = [];
    Flipped = [];
    deckDeltCount = 0;
    reshuffle = false;
    picked = [];
    pickedUp = false;
    fromDelt = false;

    for (let i = 0; i < 7; i++) {
        Stocks.push(new Array<Card>());
        for (let j = 0; j < i + 2; j++) {
            let temp: Card = getRandomCardFromArray(Deck.getAvailable());
            temp.deal();
            //temp.xPos = 200 + i * cardWidth + i * 5;
            //temp.yPos = 128 + j * Math.floor(cardHeight / 3);
            temp.initialMove(200 + i * cardWidth + i * 5, 128 + j * Math.floor(cardHeight / 3));
            Stocks[i].push(temp);
        }
        Stocks[i][Stocks[i].length - 1].reveal();
    }
}

function getRandomCardFromArray(cards: Card[]): Card {
    return cards[Math.floor(Math.random() * cards.length)]
}

//2023
function flipBool(flip: boolean): void {
    flip = !flip;
}
//2023
function returnPickedToPosition() {
    pickedUp = false;
    for (let i = 0; i < picked.length; i++) {
        picked[i].jump(picked[i].xPosOld!, picked[i].yPosOld!);
    }
    //2023
    picked = [];
    fromDelt = false;
}
//2023
function canStack(type1: number, type2: number): boolean{
    return ((type1 === Types.Diamonds || type1 === Types.Hearts) && (type2 === Types.Clover || type2 == Types.Spades))
        || (type2 === Types.Diamonds || type2 === Types.Hearts) && (type1 === Types.Clover || type1 == Types.Spades);
}

function drawDashedCardBox(ctx: CanvasRenderingContext2D, xPos: number, yPos: number, width: number, height: number, dashes: number[]) {
    xPos -= 1;
    yPos -= 1;
    ctx.setLineDash(dashes);
    ctx.beginPath();
    ctx.moveTo(xPos, yPos);
    ctx.lineTo(xPos, yPos + height);
    ctx.lineTo(xPos + width, yPos + height);
    ctx.lineTo(xPos + width, yPos);
    ctx.lineTo(xPos, yPos);
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
}

function draw() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    for (let i = 0; i < Stocks.length; i++) {
        for (let j = 0; j < Stocks[i].length; j++) {
            Stocks[i][j].draw(ctx);
        }
    }
    Back.draw(ctx);
    for (let i = 0; i < 4; i++) {
        drawDashedCardBox(ctx, Back.xPos + 297 + i * cardWidth + i * 5, Back.yPos, cardWidth + 2, cardHeight + 2, dashes);
    }
    for (let i = 0; i < Stacks.length; i++) {
        Stacks[i].topCard?.draw(ctx);
    }
    for (let i = 0; i < Delt.length; i++) {
        if (Delt[i].cardType > -1) {
            Delt[i].draw(ctx);
        }
    }
    //picked?.draw(ctx);
    for (let i = 0; i < picked.length; i++) {
        picked[i]?.draw(ctx);
    }

    let stackCount = 0;
    if(won){
        ctx.fillText("You Win", gameCanvas.width / 2, gameCanvas.height / 2);
        return;
    }
    Stacks.forEach(stack => {
        if(stack.next === 13) stackCount++
    });
    if(stackCount == 4) won = true;
    requestAnimationFrame(draw);
}

const Buttons = {
    "MouseLeft": 0,
    "MouseRight": 2
}

//New Logic try
function Logic(e: MouseEvent){
    let x = Math.floor((e.pageX - 200 - 2.5) / (cardWidth + 7.5));
    let y = Math.floor((e.pageY - 136) / Math.floor(cardHeight / 3));
    let inBounds = 0 <= x && x < 7 && e.pageY > Back.yPos + cardHeight + 15;
    let xinField = 0 <= x && x < Stocks.length;
    let yinDelt = Back.yPos + 8 < e.pageY && e.pageY < Back.yPos + cardHeight + 8;
    let xinDelt = Back.xPos + 8 + 4 + cardWidth < e.pageX && Back.xPos + 8 - 3 + cardWidth + (6 + cardWidth) * 3 > e.pageX;//2023
    let deltClicked = Math.floor((e.pageX - Back.xPos - 2.5) / (cardWidth + 7.5)) - 1;//2023
    if (e.button !== Buttons.MouseLeft && e.button !== Buttons.MouseRight) {
        return;
    }

    if(e.button === Buttons.MouseLeft){

        if(pickedUp){
            //Cards picked up
            if(0 <= x && x < Stocks.length && y >= 0){
                pickedUp = false;
                picked = [];
            }else{
                if(picked.length > 0){
                    Stocks[picked[0].getStockNr()] = Stocks[picked[0].getStockNr()].concat(picked);
                    returnPickedToPosition();
                }
            }
        }else{
            //No card picked up
            
            //clicked in field
            if (0 <= x && x < Stocks.length && y >= 0) {
                if (y > Stocks[x].length - 1) {
                    //if y outside of stack set y to last card height
                    y = Stocks[x].length - 1;
                }

                let index = y;
                for(let i = y; i < Stocks[x].length; i++){
                    if(Stocks[x][i].flipped){
                        index++;
                    }
                }
                picked = Stocks[x].splice(index, Stocks[x].length - index);
            }

            //Click in Delt
            if(xinDelt && yinDelt){
                fromDelt = true;
                picked = Delt.splice(deltClicked, 1);
            }

            pickedUp = true;
        }

        //Flip top three cards if the deck is being clicked (works)
        if ((Back.xPos + 8 < e.pageX && e.pageX < Back.xPos + cardWidth + 8) && (Back.yPos + 8 < e.pageY && e.pageY < Back.yPos + cardHeight + 8)) {
            if (Deck.getAvailable().length === 0) {
                for (let i = 0; i < Flipped.length; i++) {
                    Flipped[i].available = true;
                }
                Flipped = [];
            }
            for (let i = 0; i < Delt.length; i++) {
                Flipped.push(Delt[i]);
            }
            Delt = [];
            for (let i = 0; i < 3; i++) {
                if (Deck.getAvailable().length > 0) {
                    Delt.push(getRandomCardFromArray(Deck.getAvailable()));
                    Delt[i].stack(Back.xPos + i * (cardWidth + 5) + cardWidth + 5, Back.yPos);
                    Delt[i].reveal();
                    Delt[i].deal();
                }
            }
        }
    }

    if (e.button === Buttons.MouseRight) {
        if (0 <= x && x < Stocks.length && y >= 0) {
            if (y > Stocks[x].length - 1) {
                y = Stocks[x].length - 1;
            }
            if (Stocks[x][Stocks[x].length - 1].flipped && Stocks[x][y] === Stocks[x][Stocks[x].length - 1] && Stocks[x][y].cardValue === Stacks[Stocks[x][y].cardType].next) {//2023
                Stocks[x][y].stack(Back.xPos + 297 + Stocks[x][y].cardType * cardWidth + Stocks[x][y].cardType * 5, 10);
                Stacks[Stocks[x][y].cardType].put(Stocks[x][y]);
                Stocks[x].splice(Stocks[x].length - 1);
            }
        } else {
            let deltX = Math.floor((e.pageX - Back.xPos - 2.5) / (cardWidth + 7.5)) - 1;
            //Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
            //Delt[deltX].deal();

            //2023
            if (deltX >= 0 && deltX < Delt.length && Delt[deltX].cardValue === Stacks[Delt[deltX].cardType].next) {
                //Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
                Delt[deltX].deal();
                for (let i = Delt.length - 1; i > deltX; i--) {
                    Delt[i].stack(Delt[i - 1].xPos, Delt[i - 1].yPos);
                }
                Stacks[Delt[deltX].cardType].put(Delt[deltX]);
                Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
                for (let i = 0; i < Flipped.length; i++) {
                    if (Flipped[i] === Delt[deltX]) {
                        Flipped.splice(i, 1);
                    }
                }
                Delt.splice(deltX, 1);
            }
        }
    }
}

function ClickListener(e: MouseEvent) {

    //Logic(e);
    //return;

    //console.log(Math.floor((e.pageX - 200 - 2.5) / (cardWidth + 7.5)));
    let x = Math.floor((e.pageX - 200 - 2.5) / (cardWidth + 7.5));
    let y = Math.floor((e.pageY - 136) / Math.floor(cardHeight / 3));
    let inBounds = 0 <= x && x < 7 && e.pageY > Back.yPos + cardHeight + 15;
    let xinField = 0 <= x && x < Stocks.length;
    let yinDelt = Back.yPos + 8 < e.pageY && e.pageY < Back.yPos + cardHeight + 8;
    let xinDelt = Back.xPos + 8 + 4 + cardWidth < e.pageX && Back.xPos + 8 - 3 + cardWidth + (6 + cardWidth) * 3 > e.pageX;//2023
    let deltClicked = Math.floor((e.pageX - Back.xPos - 2.5) / (cardWidth + 7.5)) - 1;//2023
    if (e.button !== Buttons.MouseLeft && e.button !== Buttons.MouseRight) {
        return;
    }
    
    if (e.button === Buttons.MouseLeft) {
        //clicked in cards field
        if (0 <= x && x < Stocks.length) {
            if (0 <= y /*&& y < Stocks[x].length*/) {
                if (y > Stocks[x].length - 1) {
                    y = Stocks[x].length - 1;
                }

                if (pickedUp) {
                    //pickedUp = false;
                    if (Stocks[x].length > 0) {
                        if (picked.length > 0) {
                            if (picked[0].cardValue === Stocks[x][y].cardValue - 1 && canStack(picked[0].cardType, Stocks[x][y].cardType)) {
                                // for (let i = 0; i < picked.length; i++) {
                                //     Stocks[x].push(picked[i]);
                                //     let temp = Math.floor((picked[i].xPosOld! - 200 - 2.5) / (cardWidth + 7.5)) + 1;
                                //     picked[i].stack(200 + x * cardWidth + x * 5, 128 + (Stocks[x].length - 1) * Math.floor(cardHeight / 3));
                                //     Stocks[temp].splice(Stocks[temp].length - 1);
                                //     //2023
                                //     pickedUp = false;
                                //     picked = [];
                                // }
                                //2023
                                Stocks[x] = Stocks[x].concat(picked);
                                if (fromDelt) {
                                    for (let i = Delt.length - 1; i > picked[0].getDeltNr(); i--) {
                                        Delt[i].stack(Delt[i - 1].xPosOld, Delt[i - 1].yPosOld);
                                    }
                                    Delt.splice(picked[0].getDeltNr(), 1);
                                    fromDelt = false;
                                } else {
                                    //If taken from field(works)
                                    //Stocks[x] = Stocks[x].concat(picked);
                                    // Stocks[picked[0].getStockNr()].splice(Stocks[picked[0].getStockNr()].length - picked.length);
                                    // for (let i = 0; i < picked.length; i++) {
                                    //     picked[i].stack(200 + x * cardWidth + x * 5, 128 + (Stocks[x].length - picked.length + i) * Math.floor(cardHeight / 3));
                                    // }
                                    // pickedUp = false;
                                    // picked = [];
                                    Stocks[picked[0].getStockNr()].splice(Stocks[picked[0].getStockNr()].length - picked.length);
                                }
                                for (let i = 0; i < picked.length; i++) {
                                    picked[i].stack(200 + x * cardWidth + x * 5, 128 + (Stocks[x].length - picked.length + i) * Math.floor(cardHeight / 3));
                                }
                                pickedUp = false;
                                picked = [];
                            } else {
                                // pickedUp = false;
                                // for (let i = 0; i < picked.length; i++) {
                                //     picked[i].jump(picked[i].xPosOld!, picked[i].yPosOld!);
                                // }
                                // //2023
                                // picked = [];
                                // fromDelt = false;
                                returnPickedToPosition();
                            }
                        }
                    } else {//2023
                        if (picked[0]?.cardValue == Values.King && Stocks[x].length == 0) {
                            if (fromDelt) {
                                Delt.splice(picked[0].getDeltNr(), 1);
                                fromDelt = false;
                            } else {
                                console.log(picked[0].getStockNr());
                                Stocks[picked[0].getStockNr()].splice(Stocks[picked[0].getStockNr()].length - picked.length);
                            }
                            for (let i = 0; i < picked.length; i++) {
                                Stocks[x].push(picked[i]);
                                picked[i].stack(200 + x * cardWidth + x * 5, 128 + (Stocks[x].length - 1) * Math.floor(cardHeight / 3));
                            }
                            pickedUp = false;
                            picked = [];
                        } else {
                            // pickedUp = false;
                            // for (let i = 0; i < picked.length; i++) {
                            //     picked[i].jump(picked[i].xPosOld!, picked[i].yPosOld!);
                            // }
                            // picked = [];
                            returnPickedToPosition();
                        }
                    }
                } else {//Pick up
                    picked = [];
                    for (let i = y; i < Stocks[x].length; i++) {
                        if(Stocks[x].length > 0){
                            if (Stocks[x][i].flipped) {
                                picked.push(Stocks[x][i]);
                            }
                        }
                    }
                    pickedUp = true;

                    //2023
                    if (Stocks[x].length > 0) {
                        if (!Stocks[x][y].flipped) {
                            if (Stocks[x][y] === Stocks[x][Stocks[x].length - 1]) {
                                Stocks[x][y].reveal();
                                picked = [];
                                pickedUp = false;
                            }
                        }
                    }
                }
            }
        }
        //2023
        //Pickup delt cards
        //let deltClicked = Math.floor((e.pageX - Back.xPos - 2.5) / (cardWidth + 7.5)) - 1;
        if (xinDelt && yinDelt) {
            if (pickedUp) {
                pickedUp = false;
                for (let i = 0; i < picked.length; i++) {
                    picked[i].jump(picked[i].xPosOld!, picked[i].yPosOld!);
                }
                //2023
                picked = [];
                fromDelt = false;
            } else {
                if(Delt[deltClicked]){
                    picked.push(Delt[deltClicked]);
                    pickedUp = true;
                    fromDelt = true;
                }
            }
        }
        //

        //Flip top three cards if the deck is being clicked
        if ((Back.xPos + 8 < e.pageX && e.pageX < Back.xPos + cardWidth + 8) && (Back.yPos + 8 < e.pageY && e.pageY < Back.yPos + cardHeight + 8)) {
            if (Deck.getAvailable().length === 0) {
                for (let i = 0; i < Flipped.length; i++) {
                    Flipped[i].available = true;
                }
                Flipped = [];//2023
            }
            for (let i = 0; i < Delt.length; i++) {
                Flipped.push(Delt[i]);
            }
            Delt = [];
            for (let i = 0; i < 3; i++) {
                if (Deck.getAvailable().length > 0) {
                    Delt.push(getRandomCardFromArray(Deck.getAvailable()));
                    Delt[i].stack(Back.xPos + i * (cardWidth + 5) + cardWidth + 5, Back.yPos);
                    Delt[i].reveal();
                    Delt[i].deal();
                }
            }
        }
    }
    //TODO Karten auf den stapel legen
    if (e.button === Buttons.MouseRight) {
        if (0 <= x && x < Stocks.length && y >= 0) {
            if (y > Stocks[x].length - 1) {
                y = Stocks[x].length - 1;
            }
            if (Stocks[x][Stocks[x].length - 1]?.flipped && Stocks[x][Stocks[x].length - 1].cardValue === Stacks[Stocks[x][Stocks[x].length - 1].cardType].next) {//2023
            //if (Stocks[x][Stocks[x].length - 1]?.flipped && Stocks[x][y] === Stocks[x][Stocks[x].length - 1] && Stocks[x][y].cardValue === Stacks[Stocks[x][y].cardType].next) {//2023
                Stocks[x][Stocks[x].length - 1].stack(Back.xPos + 297 + Stocks[x][Stocks[x].length - 1].cardType * cardWidth + Stocks[x][Stocks[x].length - 1].cardType * 5, 10);
                //2023
                if(picked[picked.length - 1] == Stocks[x][Stocks[x].length - 1]) {
                    picked.pop();
                    if(picked.length == 0)pickedUp = false
                }
                Stacks[Stocks[x][Stocks[x].length - 1].cardType].put(Stocks[x][Stocks[x].length - 1]);
                Stocks[x].splice(Stocks[x].length - 1);
            }
        } else {
            let deltX = Math.floor((e.pageX - Back.xPos - 2.5) / (cardWidth + 7.5)) - 1;
            //Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
            //Delt[deltX].deal();

            //2023
            if (deltX >= 0 && deltX < Delt.length && Delt[deltX].cardValue === Stacks[Delt[deltX].cardType].next) {
                //Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
                Delt[deltX].deal();
                for (let i = Delt.length - 1; i > deltX; i--) {
                    Delt[i].stack(Delt[i - 1].xPosOld, Delt[i - 1].yPosOld);
                }
                Stacks[Delt[deltX].cardType].put(Delt[deltX]);
                Delt[deltX].stack(Back.xPos + 297 + Delt[deltX].cardType * cardWidth + Delt[deltX].cardType * 5, Back.yPos);
                for (let i = 0; i < Flipped.length; i++) {
                    if (Flipped[i] === Delt[deltX]) {
                        Flipped.splice(i, 1);
                    }
                }
                if(picked[picked.length - 1] == Delt[deltX]) {
                    picked.pop();
                    if(picked.length == 0)pickedUp = false
                }
                Delt.splice(deltX, 1);
            }
        }
    }
}

function MoveListener(e: MouseEvent) {
    if (pickedUp) {
        for (let i = 0; i < picked.length; i++) {
            picked[i].xPos = e.pageX - cardWidth / 2;
            picked[i].yPos = e.pageY - 20 + i * Math.floor(cardHeight / 3);
        }
    }
    //if (pickedUp)
    //picked!.xPos = e.pageX - cardWidth / 2;
    //picked!.yPos = e.pageY - 20;
}