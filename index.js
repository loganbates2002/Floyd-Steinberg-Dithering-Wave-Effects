const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const backgroundImage = new Image();
//backgroundImage.src = 'Images/RomanStatue.png'; 
backgroundImage.src = 'Images/colors.png';
const imageWidth = backgroundImage.width;
const imageHeight = backgroundImage.height;
backgroundImage.style.width = '500px';
backgroundImage.style.height = 'auto';

// Use the settings to change these for different effects, preset to wave1
const CellSize = 4;
const CellSpacingX = 12;
const CellSpacingY = 14;
const offSet = .25;
const waveEffect = 6;

var gameFrame = 0;
let particleArray = [];
let posotive = true;
let aniX = -waveEffect;
let ColorFactor = 4; // sets number of color possibilities accepted within error {1,2,4,8,16,32,64}

//handle mouse
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
  y: null,
  x: null,
  radius: 5
}
canvas.addEventListener("mousemove", function(event) { 
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mousedown', function(event){
  mouse.click = true;
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function(){
  mouse.click = false;
  dragging = false;
})

class Cell{
  constructor(r, g, b, a, x, y, dx, dy){
    this.red = r;
    this.blue = b;
    this.green = g;
    this.alpha = a;
    this.x = x - 150;
    this.y = y - 100;
    this.size = CellSize;
    this.baseY = this.y;
    this.baseX = this.x;
    this.dx = dx;
    this.dy = dy;
  }
  draw(){
    ctx.fillStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    // ctx.rect(this.x, this.y, this.size,this.size); draws squares instead of circles for pixelated effect
    ctx.closePath();
    ctx.fill();
  }
  update(aniX){
    this.x += aniX;
    this.y += aniX;
  }
}

/* gets Image data and creates array of particles with r,g,b,a,x,y values,
     filtering pixels through the Floyd–Steinberg dithering algorithm */

function createParticleArray(){
    ctx.drawImage(backgroundImage, 0, 0, imageWidth, imageHeight);
    const pixels = ctx.getImageData(0, 0, imageWidth, imageHeight);
    for(let y = 0; y < pixels.height-1; y++){
      particleArrayRow = [];
      for (let x = 1; x <  pixels.width-1; x++){
        let currentRed = pixels.data[(y * 4 * pixels.width) + (x * 4)];
        let currentGreen = pixels.data[(y * 4 * pixels.width) + (x * 4 + 1)];
        let currentBlue = pixels.data[(y * 4 * pixels.width) + (x * 4 + 2)];
        let currentAlpha = pixels.data[(y * 4 * pixels.width) + (x * 4 + 3)];
        let positionX = x * (imageWidth/pixels.width);
        let positionY = y * (imageHeight/pixels.height);

        let factor = ColorFactor;
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

        let cellSpacingX = CellSpacingX;
        let cellSpacingY = CellSpacingY;

        particleArrayRow.push(new Cell(roundedRed, roundedGreen, roundedBlue, currentAlpha, positionX * cellSpacingX, positionY * cellSpacingY));
      }
      particleArray.push(particleArrayRow);
    }
}
// sets each pixel of imageData to a greyscaled RGB value
function greyscale(imgPixels) {
  for(var y = 0; y < imgPixels.height; y++){
    for(var x = 0; x < imgPixels.width; x++){
        var i = (y * 4) * imgPixels.width + x * 4;
        var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
    }
  }
  return imgPixels;
}

function start(){
  createParticleArray();
  animate();
}

function animate(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
    for(let i=0; i < particleArray.length; i+=2){
      for(let j=0; j < particleArray.length; j+=2){
        if(aniX < waveEffect && posotive){
          aniX += offSet;
        } else if(aniX == waveEffect){
            aniX -= offSet;
            posotive = false;
        } else if(aniX > -waveEffect && ! posotive){
            aniX -= offSet;
        } else if(aniX == -waveEffect && !posotive){
            aniX+= offSet;
            posotive = true;
        }
        particleArray[j][i].draw();
        particleArray[j][i].update(aniX);
      }
    }
    gameFrame++;
    requestAnimationFrame(animate);
}

window.addEventListener('load', event => {
  start();
});
