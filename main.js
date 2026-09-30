var canvas=document.getElementById("game");
var ctx=canvas.getContext("2d");

const WIDTH=1920, HEIGHT=1080;
var SPEED=1;

var AMOUNT=900;//temp change back to 100
var REPROD=30;
var GENS=0;
var SCORE=0;
var HIGHSCORE=0;

var GAMETICK;
const SPAWNRATE=120;//every 2 second - ish



const HIDDEN=2;
const SIZEROW=4;
const INPUT=4;
const OUTPUT=1;

const MUTATECHANCE=0.01;
const MUTATION=0.1;

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
        //first create inputs
        var results=[];
        results.push([]);//first row
        //this y, gap y, distance x, and sy;
        results[0].push(this.y / HEIGHT);//scaled height
        //get a pipe
        
        var thePipe;
        for(var pipe of PIPES){
            if(pipe.x>this.x-this.width/2){
                thePipe=pipe;
                break;
            }
        }
        if(thePipe==null){
            results[0].push((HEIGHT/2)/HEIGHT);//any place but scaled
            //any distance
            results[0].push(1)//scaled
        }else{
            results[0].push(thePipe.y/HEIGHT)//scaled
            results[0].push((thePipe.x-(this.x-this.width/2))/WIDTH);
                //distance to left edge of the bird
        }
        results[0].push(this.sy/20);//scaled by 20

        //this is the first column
        for(var i=0; i<=HIDDEN; i++){
            results.push([]);//new row
            for(var j=0; j<(i==HIDDEN? OUTPUT : SIZEROW); j++){
                //for each element
                var temp=0;
                for(var k=0; k<(i==0? INPUT: SIZEROW); k++){
                    //automatic past as i=0 has row 1
                    temp+=results[i][k]*this.weights[i][j][k];
                }
                temp+=this.biases[i][j];
                if(i!=HIDDEN)temp=Math.max(0,temp);//relu for other
                results[i+1].push(temp);
            }
        }
        return (results[HIDDEN+1][0]>0);
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
    document.getElementById("high").textContent=HIGHSCORE;
}


function spawnBirds(){
    if(GENS<=1){
        //first generation, random for each
        for(var it=0; it<AMOUNT; it++){
            var tempWeight=[];
            var tempBias=[];
            //generate biases first
            for(var i=0; i<=HIDDEN; i++){
                tempBias.push([]);
                for(var j=0; j<(i==HIDDEN? OUTPUT : SIZEROW); j++){
                    tempBias[i].push(Math.random()*2-1);//from -1 to 1
                }
            }
            //generate weights now
            for(var i=0; i<=HIDDEN; i++){
                tempWeight.push([]);
                //from row i's jth to kth
                for(var j=0; j<(i==HIDDEN ? OUTPUT: SIZEROW); j++){
                    tempWeight[i].push([]);
                    for(var k=0; k<(i==0? INPUT : SIZEROW); k++){
                        tempWeight[i][j].push(Math.random()*2-1);//random link 
                        //row i j to prev k
                    }
                }
            }


            BIRDS.push(new Bird(tempWeight,tempBias));
        }
        
    }else{
        var LIVERS=DEAD.slice(AMOUNT-REPROD);//REPROD eleements
        for(var m=0; m<REPROD; m++){
            for(var d=0; d<REPROD; d++){
                var mom=LIVERS[m];
                var dad=LIVERS[d];
                //mom and dad
                var tempWeight=[];
                var tempBias=[];
                //generate biases first
                for(var i=0; i<=HIDDEN; i++){
                    tempBias.push([]);
                    for(var j=0; j<(i==HIDDEN? OUTPUT : SIZEROW); j++){
                        tempBias[i].push((Math.random()>0.5?
                        mom.biases[i][j]:dad.biases[i][j]));
                        if(Math.random()<=MUTATECHANCE){
                            tempBias[i][j]+=(Math.random()*2*MUTATION)-MUTATION;
                        }
                    }
                }
                //generate weights now
                for(var i=0; i<=HIDDEN; i++){
                    tempWeight.push([]);
                    //from row i's jth to kth
                    for(var j=0; j<(i==HIDDEN ? OUTPUT: SIZEROW); j++){
                        tempWeight[i].push([]);
                        for(var k=0; k<(i==0? INPUT : SIZEROW); k++){
                            tempWeight[i][j].push(Math.random()>0.5?
                                mom.weights[i][j][k]:dad.weights[i][j][k]
                            );//random link 
                            if(Math.random()<=MUTATECHANCE){
                                tempWeight[i][j][k]+=(Math.random()*2*MUTATION)-MUTATION
                            }
                            
                            //row i j to prev k
                        }
                    }
                }
                BIRDS.push(new Bird(tempWeight, tempBias));
            }
        }
    }

}


function newGame(){
    GENS++;
    SCORE=0;

    BIRDS=[];
    PIPES=[];

    //spawn birds
    spawnBirds();

    DEAD=[];

    GAMETICK=0;

    

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
    
    
    while(PIPES.length>0 && PIPES[0].delete){
        PIPES.shift();
        
        SCORE++;
        HIGHSCORE=Math.max(SCORE,HIGHSCORE);
    }

    //kill birds
    var survivors=[];
    for(var bird of BIRDS){
        if(!bird.dead){
            survivors.push(bird);
        }else{
            DEAD.push(bird);
        }
    }

    BIRDS=survivors;
    
    //spawn pipes
    if(GAMETICK%SPAWNRATE==0){
        PIPES.push(new Pipe());
    }
    GAMETICK++;

    //new game
    if(BIRDS.length==0)newGame();
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

    if(ev.key=='f'){
        SPEED=5; //fast
    }
    if(ev.key=='h'){
        SPEED=50; //hyper
    }
    if(ev.key=='t'){
        SPEED=1000; //turbo
    }
    if(ev.key=='g'){
        SPEED=10_000; //god
    }
    
})
window.addEventListener("keyup",function(ev){
    if(ev.key=='f' || ev.key=='h' || ev.key=='t' || ev.key=='g'){
        SPEED=1;
    }
})