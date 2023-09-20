import React, { useEffect, useRef } from 'react';

export default function GameSection({ scores, imgSource, isize }) {
    const [theme, setTheme] = React.useState(0);
    const [size, setSize] = React.useState(isize);

    function changeTheme() {setTheme((theme + 1) % 4);}
    function incSize() {setSize(size + 1);}
    function decSize() {setSize(size - 1);}
    
    return (
        <div className='game-container'>
            <GameBanner changeTheme={changeTheme} incSize={incSize} decSize={decSize}/>
            <GameDisplay scores={scores} imgSource={imgSource} theme={theme} size={size}/>
        </div>
    );
}

function GameBanner({ changeTheme, incSize, decSize }) {
    return (
        <h2>Community Display Game 
            <button onClick={changeTheme}>Change Theme</button>
            <button onClick={incSize}>incSize</button>
            <button onClick={decSize}>DecSize</button>
        </h2>
    )
}

//Take in an array of numbers -> re order to have in display order
function GameDisplay({ scores, imgSource, theme, size }) {
    const [imageLoading, setImageLoading] = React.useState(0);

    const canvasRef = useRef(null);
    useEffect(() => {
        const images = imgSource.map((src) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {setImageLoading(imageLoading+1)};
            return image;
        });

        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            updateCanvas(canvas, theme, images, scores, size)
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {window.removeEventListener('resize', resizeCanvas);};
    }, [scores, imgSource, theme, size, imageLoading])

    return (
        <div className='canvas-container'>
            <canvas ref={canvasRef} /> 
        </div>
    );
}

function updateCanvas(canvas, theme, images, given_scores, size) {
    const context = canvas.getContext('2d');
    context.globalAlpha = 1;
    const canvasContainer = canvas.parentElement;
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;

    //Hardcoded values:
    context.fillStyle = ["#4a9547", "lightblue", "#ffd16e", "pink"][theme];
    context.fillRect(0, 0, canvas.width, canvas.height);
    const imageSize = 1024;
    const Xoverlap = 1024 - 664 - 498; 
    const Yoverlap = 1024 - 180 - 135; 

    //Derived values
    const finalRow = 2 * size;
    const scale = (canvas.height / ((imageSize - Yoverlap) * (finalRow + 1) + Yoverlap)) * 0.99;
    const finalCol = Math.floor(((canvas.width / scale) - Xoverlap) / (imageSize - Xoverlap)) - 1;
    const effectiveWidth = scale * (imageSize - Xoverlap);
    const effectiveHeight = scale * (imageSize - Yoverlap);
    const xOffset = (canvas.width - (effectiveWidth * (finalCol + 1) + scale * Xoverlap)) / 2;
    const yOffset = (canvas.height - (effectiveHeight * (finalRow + 1) + scale * Yoverlap)) / 4;

    //Count number of tiles
    let count = 0;
    for (let row = 0; row <= finalRow; row++) {
        for (let col = 0; col <= finalCol; col++) {
            if ((row % 2 == 1 && col == finalCol) || (row == 0 && col == 0) || 
                    (row == 0 && col == finalCol) || (row == finalRow && col == 0) || 
                    (row == finalRow && col == finalCol)) {continue}
            count += 1
        }
    }

    const scores = arrangePyramid(given_scores, count);
    let scoreInc = 0;
    for (let row = 0; row <= finalRow; row++) {
        for (let col = 0; col <= finalCol; col++) {
            //Skip the final column and the corners
            if ((row % 2 == 1 && col == finalCol) || (row == 0 && col == 0) || 
                    (row == 0 && col == finalCol) || (row == finalRow && col == 0) || 
                    (row == finalRow && col == finalCol)) {continue}
            const imgIndex = (scores[scoreInc % scores.length] == 0 ? 0 : scores[scoreInc % scores.length] + 5 * theme);
            scoreInc += 1;
            const image = images[imgIndex] ?? images[0];
            let x = (col + ((row % 2) / 2)) * effectiveWidth;
            let y = row * effectiveHeight;
            context.drawImage(image, x + xOffset, y + yOffset, image.width * scale, image.height * scale);
        }
    }
}

//Make this functon better?
function arrangePyramid(scores, n) {
    // Sort the scores array in descending order
    const sortedScores = scores.sort((a, b) => b - a);
    
    let left = Math.floor(n / 2);
    let right = left
    const display = new Array(n).fill(0); 
    // Start with the center and place the highest value
    display[Math.floor(n / 2)] = sortedScores[0];
    
    let scoreIndex = 1;
    for (let level = 1; level <= Math.floor(n / 2); level++) {
      left--;
      display[left] = sortedScores[scoreIndex];
      scoreIndex++;
      
      if (scoreIndex < sortedScores.length) {
        right++;
        display[right] = sortedScores[scoreIndex];
        scoreIndex++;
      }
    }
    return display;
  }