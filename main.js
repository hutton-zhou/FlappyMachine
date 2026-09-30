var canvas=document.getElementById("game");
var ctx=canvas.getContext("2d");

const WIDTH=1920, HEIGHT=1080;
var SPEED=1;

var GENS=0;
var SCORE=0;
var ALIVE=100;

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

        this.x=200;
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
        if(jump){
            jump=false;
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
            //dying logic done
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
    }
}

var BIRDS=[];
var PIPES=[];
var DEAD=[];

function newGame(){
    GENS++;
    SCORE=0;
    ALIVE=100;

    BIRDS=[];
    PIPES=[];
    DEAD=[];

    GAMETICK=0;

    BIRDS.push(new Bird());
    
}

function logic(){
    //each bird
    for(var bird of BIRDS){
        bird.logic();
    }
    for(var pipe of PIPES){
        pipe.logic();
    }
    //kill birds
    var ptr=0;
    while(ptr<BIRDS.length){
        if(BIRDS[ptr].dead){
            DEAD.push(BIRDS.pop(ptr));
        }else{
            ptr++;
        }
    }
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
})