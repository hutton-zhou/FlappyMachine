var canvas=document.getElementById("game");
var ctx=canvas.getContext("2d");

const WIDTH=1920, HEIGHT=1080;
var SPEED=1;

var AMOUNT=1000;//temp change back to 100
var GENS=0;
var SCORE=0;
var HIGHSCORE=0;

var GAMETICK;
const SPAWNRATE=120;//every 2 second - ish

var jump=false; //temp

const HIDDEN=1;
const SIZEROW=5;


const BirdIMG=document.getElementById("birdIMG");

class Bird{
    constructor(weights, biases){
        var scale=3;
        this.width=34*scale;
        this.height=24*scale;
        this.halfW=this.width/2;
        this.halfH=this.height/2; //all constant

        this.x=100;
        this.y=(1080/2);//center coordinate

        this.JUMPH=-20;
        this.GRAV=1.5;
        this.sy=0;
        //ai things
        this.weights=weights;//weights[i][j][k] is column i from node j to node k 
        // (0 for first, HIDDEN for last)
        this.biases=biases; // biases[i][j] is the bias for column i square j
        //first layer is 0, output is HIDDEN

        this.dead=false;
    }
    draw(){
        ctx.drawImage(BirdIMG,this.x-this.halfW,this.y-this.halfH,this.width,this.height);
    }
    neural(){
        //every layer
        //temporary, just jump
        /*if(jump){
            jump=false;
            return true;
        }return false;*/
        if(Math.random()<0.06){
            return true;
        }return false;
    }
    logic(){
        if(this.neural()){
            this.sy=this.JUMPH;
        }
        this.sy+=this.GRAV;
        this.y+=this.sy;

        //hit pipe
        if(PIPES.length>0){
            var x1,x2,w1,w2;
            x1=this.x-this.width/2;
            x2=PIPES[0].x-PIPES[0].width;//buffer
            w1=this.width;
            w2=PIPES[0].width;
            if(x1<x2+w2 && x2<x1+w1){
                //possible
                if(this.y-this.height/2 < PIPES[0].y-PIPES[0].gap/2){
                    this.dead=true;
                }
                if(this.y+this.height/2 > PIPES[0].y+PIPES[0].gap/2){
                    this.dead=true;
                }
            }
            //dying logic for pipes
        }
        if(this.y+this.height/2>HEIGHT+this.height){
            //die
            this.dead=true;
        }if(this.y-this.height/2<-this.height){
            this.dead=true;
        }
        

    }
}
class Pipe{
    constructor(){
        this.width=175;//temporary
        this.x=WIDTH+this.width //the right side
        this.gap=350;//good enough
        this.y=Math.random()*((HEIGHT-this.gap/2)-(this.gap/2))+(this.gap/2)
        //constrain the random
        this.speed=6;
        this.delete=false;
    }
    draw(){
        ctx.fillStyle="green";
        ctx.fillRect(this.x-this.width,0,this.width,this.y-this.gap/2);
        ctx.fillRect(this.x-this.width,this.y+this.gap/2,this.width,HEIGHT-
            (this.y+this.gap/2)
        );
    }
    logic(){
        this.x-=this.speed;
        if(this.x<0){
            SCORE++;
            this.delete=true;
        }
    }
}

var BIRDS=[];
var PIPES=[];
var DEAD=[];
function displayAll(){
    document.getElementById("gen").textContent=GENS;
    document.getElementById("score").textContent=SCORE;
    document.getElementById("alive").textContent=BIRDS.length;
    HIGHSCORE=Math.max(SCORE,HIGHSCORE);
    document.getElementById("high").textContent=HIGHSCORE;
}




function newGame(){
    GENS++;
    SCORE=0;

    BIRDS=[];
    PIPES=[];
    DEAD=[];

    GAMETICK=0;

    for(var i=0; i<AMOUNT; i++){
        BIRDS.push(new Bird());
    }

    displayAll();
    
}

function logic(){
    //each bird
    for(var bird of BIRDS){
        bird.logic();
    }
    for(var pipe of PIPES){
        pipe.logic();
    }
    
    
    while(PIPES.length>0 && PIPES[0].delete)PIPES.shift();
    //kill birds
    var survivors=[];
    for(var bird of BIRDS){
        if(!bird.dead){
            survivors.push(bird);
        }else{
            DEAD.push(bird);
        }
    }
    if(BIRDS.length>=1 && survivors.length==0){
        setTimeout(newGame,250);
    }
    BIRDS=survivors;
    
    //spawn pipes
    if(GAMETICK%SPAWNRATE==0){
        PIPES.push(new Pipe());
    }
    GAMETICK++;
}

function draw(){
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    for(var bird of BIRDS){
        bird.draw();
    }
    for(var pipe of PIPES){
        pipe.draw();
    }
    displayAll();
}

function gameLoop(){
    for(var i=0; i<SPEED; i++){
        logic();
    }
    draw();
    requestAnimationFrame(gameLoop);
}


newGame();
requestAnimationFrame(gameLoop);




window.addEventListener("keydown",function(ev){
    if(ev.key==' '){
        jump=true;
        
    }
    if(ev.key=='f'){
        SPEED=3;
    }
    if(ev.key=='t'){
        SPEED=5;
    }
})
window.addEventListener("keyup",function(ev){
    if(ev.key=='f' || ev.key=='t'){
        SPEED=1;
    }
})