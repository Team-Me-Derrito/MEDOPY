import React, { useEffect, useRef } from 'react';
import styles from './GameSection.module.css'

export default function GameSection({ scores, imgSource, isize }) {
    const [theme, setTheme] = React.useState(0);
    const [size, setSize] = React.useState(isize);

    function changeTheme() { setTheme((theme + 1) % 4); }
    function changeSize(change) { setSize(size + change) }

    return (
        <div className={styles['game-container']}>
            <GameBanner changeTheme={changeTheme} changeSize={changeSize} />
            <GameDisplay scores={scores} imgSource={imgSource} theme={theme} size={size} />
        </div>
    );
}

function GameBanner({ changeTheme, changeSize }) {
    return (
        <h2>Community Display Game
            <button onClick={changeTheme}>Change Theme</button>
            <button onClick={() => changeSize(1)}>incSize</button>
            <button onClick={() => changeSize(-1)}>DecSize</button>
        </h2>
    )
}

//Take in an array of numbers -> re order to have in display order
function GameDisplay({ scores, imgSource, theme, size }) {
    //State to update image loading
    const [imageLoading, setImageLoading] = React.useState(0);

    const canvasRef = useRef(null);
    useEffect(() => {
        const images = imgSource.map((src) => {
            const image = new Image();
            image.src = src;
            image.onload = () => { setImageLoading(imageLoading + 1) };
            return image;
        });

        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            updateCanvas(canvas, theme, images, scores, size)
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => { window.removeEventListener('resize', resizeCanvas); };
    }, [scores, theme, size, imageLoading])

    return (
        <div className={styles['canvas-container']}>
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

    const tileCount = Math.max(0, (finalRow + 1) * (finalCol + 1) - 4 - finalRow / 2);
    const scores = permuteScores(given_scores, tileCount);


    let scoreInc = 0;
    for (let row = 0; row <= finalRow; row++) {
        for (let col = 0; col <= finalCol; col++) {
            //Skip the final column and the corners
            if ((row % 2 == 1 && col == finalCol) || (row == 0 && col == 0) ||
                (row == 0 && col == finalCol) || (row == finalRow && col == 0) ||
                (row == finalRow && col == finalCol)) { continue }
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
function permuteScores(scores, n) {
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


import { generatePerlinNoise } from 'perlin-noise'

function perlinMap(finalRow, finalCol) {
    const n = finalRow + 1;
    const m = finalCol + 1;
    let integerArray;
    let checkMid = false;
    var arr = [];
    var it = 0;
    while (checkMid == false) {
        it++;
        arr = generatePerlinNoise(m, n, {octaveCount : 2, persistence : 0.01});
        for (let row = 0; row <= finalRow; row++) {
            for (let col = 0; col <= finalCol; col++) {
                //Skip the final column and the corners
                if ((row % 2 == 1 && col == finalCol) || (row == 0 && col == 0) ||
                    (row == 0 && col == finalCol) || (row == finalRow && col == 0) ||
                    (row == finalRow && col == finalCol)) {
                        arr[row * m + col] = 1;
                    } 
            }
        }
        
        const indexedArray = arr.map((value, index) => ({ value, index }));
        indexedArray.sort((a, b) => a.value - b.value).forEach((item, newIndex) => {item.newIndex = newIndex;});
    
        integerArray = new Array(arr.length);
        indexedArray.forEach((item) => {integerArray[item.index] = item.newIndex;});
    
        // console.log(`N: ${Math.floor(n * 3 / 10)} ; row < ${Math.ceil(n * 7 / 10)}`)
        // console.log(`M: ${Math.floor(m * 3 / 10)} ; col < ${Math.ceil(m * 7 / 10)}`)
        //prn2d(integerArray, n, m)

        for (let row = Math.floor(n * 3 / 10); row < Math.ceil(n * 7 / 10); row++) {
            for (let col = Math.floor(m * 3 / 10); col < Math.ceil(m * 7 / 10); col++) {
                // console.log(`found at row: ${row} and col: ${col}, value: ${integerArray[row * m + col]}`)
                if (integerArray[row * m + col] == 0) {
                    //console.log(`found at row: ${row} and col: ${col}`)
                    checkMid = true;
                }
            }
        }
        // console.log(it)
        //prompt()
        // if (it > 10000) {return [1];}
    }

    console.log(it)

    // prn2d(arr, n, m)
    prn2d(integerArray, n, m)
    return integerArray;
}

function prn2d(arr, n, m) {
    for (let i = 0; i < n; i++) {
        const row = arr.slice(i * m, (i + 1) * m);
        console.log(row.join('\t'));
    }
}



