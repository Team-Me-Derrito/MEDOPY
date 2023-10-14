import React, { useEffect, useRef } from 'react';
import styles from './GameSection.module.css'
import { generatePerlinNoise } from 'perlin-noise'
import { IMAGE_SOURCES } from '@/public/constants/ImagePaths';

//Improve game banner

export default function GameSection({ scores, isize }) {
    //Determine rows based on number of scores?

    const [theme, setTheme] = React.useState(0);
    const [rowSize, setRowSize] = React.useState(isize * 2 + 1);

    function changeTheme() { setTheme((theme + 1) % 4); }
    function changeSize(change) { setRowSize(rowSize + 2 * change) }

    return (
        <div className={styles['game-container']}>
            <div className={styles['game-banner-container']}>
                <GameBanner changeTheme={changeTheme} changeSize={changeSize} />
            </div>
            <GameDisplay scores={scores} theme={theme} rowSize={rowSize} />
            <div className={styles['game-button-container']}>
                <button onClick={() => changeTheme()}>Change Theme</button>
                <button onClick={() => changeSize(1)}>incSize</button>
                <button onClick={() => changeSize(-1)}>DecSize</button>
            </div>
        </div>
    );
}

function GameBanner({ }) {
    return (
        <div className={styles['game-banner']}>
            <h2>Community Display</h2>
        </div>
    )
}

//Take in an array of numbers -> re order to have in display order
function GameDisplay({ scores, theme, rowSize }) {
    const [firstLoad, setFirstLoad] = React.useState(true);

    const [displayScores, setDisplayScores] = React.useState(scores);
    function setPermutate(scores, rows, cols) { setDisplayScores(permuteScores(scores, rows, cols)) }

    const [colSize, setColSize] = React.useState(0);
    function updateColSize(newCol, reload) {
        if (reload || colSize != newCol) {
            setColSize(newCol)
            setPermutate(scores, rowSize, colSize)
        }
    }

    const canvasRef = useRef(null);
    useEffect(() => {
        const images = IMAGE_SOURCES.map((src, index) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                if (firstLoad) {
                    setPermutate(scores, rowSize, colSize)
                    setFirstLoad(false)
                }
                window.dispatchEvent(new Event('resize'))
            };
            return image;
        });

        const canvas = canvasRef.current;
        const resizeCanvas = () => {
            updateCanvas(canvas, images, theme,
                rowSize, colSize, updateColSize,
                displayScores)
        };

        window.addEventListener('resize', resizeCanvas);
        return () => { window.removeEventListener('resize', resizeCanvas); };
    }, [displayScores, theme, rowSize, colSize])

    return (
        <div className={styles['canvas-container']}>
            <canvas ref={canvasRef} />
            {/* Temp Button (Use tab) */}
            <button onClick={() => updateColSize(colSize, true)}>Change Theme</button>
        </div>
    );
}

function updateCanvas(canvas, images, theme, rowSize, col, updateColSize, scores) {
    //Canvas size
    const canvasContainer = canvas.parentElement;
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;

    //Canvas fill
    const context = canvas.getContext('2d');
    context.globalAlpha = 1;
    context.fillStyle = ["#4a9547", "lightblue", "#ffd16e", "pink"][theme];
    context.fillRect(0, 0, canvas.width, canvas.height);

    //coded values:
    const finalRow = rowSize;
    const imageSize = 1024;
    const Xoverlap = 1024 - 664 - 498;
    const Yoverlap = 1024 - 180 - 135;

    //Layout values
    const scale = (canvas.height / ((imageSize - Yoverlap) * (finalRow) + Yoverlap)) * 0.99;
    const finalCol = Math.floor(((canvas.width / scale) - Xoverlap) / (imageSize - Xoverlap));
    if (finalCol != col) { updateColSize(finalCol, false) }

    //Image adjustment values
    const effectiveWidth = scale * (imageSize - Xoverlap);
    const effectiveHeight = scale * (imageSize - Yoverlap);
    const xOffset = (canvas.width - (effectiveWidth * (finalCol) + scale * Xoverlap)) / 2;
    const yOffset = (canvas.height - (effectiveHeight * (finalRow) + scale * Yoverlap)) / 4;

    //const tileCount = Math.max(0, (finalRow) * (finalCol) - 4 - finalRow / 2);
    //Place images in grid
    let scoreInc = 0;
    for (let row = 0; row < finalRow; row++) {
        for (let col = 0; col < finalCol; col++) {
            //Skip the final column and the corners
            if ((row % 2 == 1 && col + 1 == finalCol) || (row == 0 && col == 0) ||
                (row == 0 && col + 1 == finalCol) || (row + 1 == finalRow && col == 0) ||
                (row + 1 == finalRow && col + 1 == finalCol)) { continue }
            const imgIndex = (scores[scoreInc % scores.length] == 0 ? 0 : scores[scoreInc % scores.length] + 5 * theme);
            scoreInc += 1;
            const image = images[imgIndex] ?? images[0];
            let x = (col + ((row % 2) / 2)) * effectiveWidth;
            let y = row * effectiveHeight;
            context.drawImage(image, x + xOffset, y + yOffset, image.width * scale, image.height * scale);
        }
    }
}

function permuteScores(scores, n, m) {
    //Array to generate random noise in 2d grid
    const arr = generatePerlinNoise(m, n, { octaveCount: 2, persistence: 0.02 })

    //Sort noise based on value and stores original index
    const indexedArray = arr.map((value, index) => ({ value, index }));
    indexedArray.sort((a, b) => b.value - a.value).forEach((item, newIndex) => { item.newIndex = newIndex; });

    //New array that restores the sorted ordering to the orginal positions
    const integerArray = new Array(arr.length);
    indexedArray.forEach((item) => { integerArray[item.index] = item.newIndex; });

    //Place sorted into index array at index
    const sortedScores = scores.sort()
    const scoreArray = integerArray.map(indexAtIndex => sortedScores[indexAtIndex % sortedScores.length]);

    return scoreArray;
}

function formatNumber(num) {
    return (num).toFixed(2).padStart(3, '0');
}

function format2DArray(arr, n, m) {
    for (let i = 0; i < n; i++) {
        const row = arr.slice(i * m, (i + 1) * m);
        const formatRow = row.map(num => formatNumber(num))
        console.log(formatRow.join('\t'));
    }
}

function prn2d(arr, n, m) {
    for (let i = 0; i < n; i++) {
        const row = arr.slice(i * m, (i + 1) * m);
        console.log(row.join('\t'));
    }
}