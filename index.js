const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const backgroundImage = new Image();
backgroundImage.src = 'Images/RomanStatue.png';
//backgroundImage.src = 'Images/colors.png';
const imageWidth = backgroundImage.width;
const imageHeight = backgroundImage.height;

var gameFrame = 0;
let particleArray = [];

//var myImageData = ctx.createImageData(width, height);
//var myImageData = c.getImageData(left, top, width, height);

//handle mouse
const mouse = {
  y: null,
  x: null,
  radius: 150
}

canvas.addEventListener("mousemove", function(event) { 
  mouse.x = event.x;
  mouse.y = event.y;
});

class Cell{
  constructor(r, g, b, a, x, y){
    this.red = r;
    this.blue = b;
    this.green = g;
    this.alpha = a;
    this.x = x;
    this.y = y;
    this.size = 1;
    this.baseY = this.y
    this.baseX = this.x
    this.density = ( Math.random() * 40 ) + 1;
  }

  draw(){
    //ctx.fillstyle = "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
    ctx.fillStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    ctx.beginPath();
    //ctx.arc(this.x + (canvas.width/2 - imageWidth/2), this.y + (canvas.height/2 - imageHeight/2), this.size, 0, Math.PI*2);
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    
    ctx.closePath();
    ctx.fill();
  }
  update(){
    let p = 0;
  }
}

function start(){
  /*ctx.fillStyle = 'white';
  ctx.font = '30px Verdana';
  ctx.fillText('A',0,30);*/
  createParticleArray();
  animate();
}

// get image data
//display pixels as square objects in an array

// gets Image data and creates array of particles with r,g,b,a,x,y values
function createParticleArray(){
    //particleArray = []
    ctx.drawImage(backgroundImage, 0, 0, imageWidth, imageHeight);
    const pixels = ctx.getImageData(0, 0, imageWidth, imageHeight);
    //console.log(pixels);
    for(let y = 0; y < pixels.height-1; y++){
      for (let x = 1; x <  pixels.width-1; x++){
        let currentRed = pixels.data[(y * 4 * pixels.width) + (x * 4)];
        let currentGreen = pixels.data[(y * 4 * pixels.width) + (x * 4 + 1)];
        let currentBlue = pixels.data[(y * 4 * pixels.width) + (x * 4 + 2)];
        let currentAlpha = pixels.data[(y * 4 * pixels.width) + (x * 4 + 3)];
        let positionX = x * (imageWidth/pixels.width);
        let positionY = y * (imageHeight/pixels.height);

        let factor = 4;
        let roundedRed = Math.round(factor * currentRed / 255) * (255 / factor);
        let roundedGreen = Math.round(factor * currentGreen / 255) * (255 / factor);
        let roundedBlue = Math.round(factor * currentBlue / 255) * (255 / factor);
        let errRed = currentRed - roundedRed;
        let errGreen = currentGreen - roundedGreen;
        let errBlue = currentBlue - roundedBlue;

        //pixels[x + 1][y    ] := pixels[x + 1][y    ] + quant_error × 7 / 16
        let rI = pixels.data[(y * 4 * pixels.width) + (x * 4 + 4)];
        let gI = pixels.data[(y * 4 * pixels.width) + (x * 4 + 5)];
        let bI = pixels.data[(y * 4 * pixels.width) + (x * 4 + 6)];
        rI = rI + errRed * 7/16;
        gI = gI + errGreen * 7/16;
        bI = bI + errBlue * 7/16;
        pixels.data[(y * 4 * pixels.width) + (x * 4 + 4)] = rI;
        pixels.data[(y * 4 * pixels.width) + (x * 4 + 5)] = gI;
        pixels.data[(y * 4 * pixels.width) + (x * 4 + 6)] = bI;

        //pixels[x - 1][y + 1] := pixels[x - 1][y + 1] + quant_error × 3 / 16
        let rII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 4)];
        let gII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 3)];
        let bII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 2)];
        rII = rII + errRed * 3/16;
        gII = gII + errGreen * 3/16;
        bII = bII + errBlue * 3/16;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 4)] = rII;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 3)] = gII;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 - 2)] = bII;

        //pixels[x    ][y + 1] := pixels[x    ][y + 1] + quant_error × 5 / 16
        let rIII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4)];
        let gIII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 1)];
        let bIII = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 2)];
        rIII = rIII + errRed * 5/16;
        gIII = gIII + errGreen * 5/16;
        bIII = bIII + errBlue * 5/16;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4)] = rIII;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 1)] = gIII;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 2)] = bIII;

        //pixels[x + 1][y + 1] := pixels[x + 1][y + 1] + quant_error × 1 / 16 
        let rIV = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 4)];
        let gIV = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 5)];
        let bIV = pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 6)];
        rIV = rIV + errRed * 1/16;
        gIV = gIV + errGreen * 1/16;
        bIV = bIV + errBlue * 1/16;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 4)] = rIV;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 5)] = gIV;
        pixels.data[(y * 4 * pixels.width + 1) + (x * 4 + 6)] = bIV;

        let cellSpacing = 4;
        particleArray.push(new Cell(roundedRed, roundedGreen, roundedBlue, currentAlpha, positionX * cellSpacing, positionY * cellSpacing));
      }
    }
   console.log(particleArray);
}

function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    for(let i=0; i < particleArray.length; i++){
      /* 
      if(particleArray[i].alpha == 255){
        particleArray[i].draw();
      }*/
      particleArray[i].draw();
  
      //particleArray[i].update();
    }
    //console.log(myImageData)
    
    gameFrame++;
    //requestAnimationFrame(animate);
}

window.addEventListener('load', event => {
  start();
});
