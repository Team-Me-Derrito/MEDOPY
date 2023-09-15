import React, { useEffect, useRef } from 'react';

const rowParam = {
    "s" : {
        "offset" : 0,
        "scale" : 0.25,
        "layout" :[
            [1, 3],
            [0, 3],
            [1, 3],
            [0, 3],
            [1, 3],
            [0, 3],
            [1, 3]
        ]
    },
    "m" : {
        "offset" : 1,
        "scale" : 0.2,
        "layout" :[[1, 3],
        [1, 4],
        [0, 4],
        [1, 4],
        [0, 4],
        [1, 4],
        [0, 4],
        [1, 4],
        [1, 3]],
    },
    "l" : {
        "offset" : 0,
        "scale" : 0.17,
        "layout" : [
            [2, 4],
            [1, 4],
            [1, 5],
            [0, 5],
            [1, 5],
            [0, 5],
            [1, 5],
            [0, 5],
            [1, 5],
            [1, 4],
            [2, 4]
        ]
    },
};

export default function GameSection({ scores, imgSource }) {
    const [theme, setTheme] = React.useState(0)
    function handleClick() {setTheme((theme + 1) % 4);}

    return (
        <div>
            <h2>Community Display Game <button onClick={handleClick}> Change Theme</button></h2>
            <GameDisplay scores={scores} imgSource={imgSource} theme={theme} size={"m"}/>
        </div>
    );
}

//Take in an array of numbers -> re order to have in display order
function GameDisplay({ scores, imgSource, theme, size }) {
    const canvasRef = useRef(null);
    const canvasWidth = 1200; 
    const canvasHeight = 800; 

    const layout = rowParam[size]["layout"]
    const offset = rowParam[size]["offset"]
    const scale = rowParam[size]["scale"]
    const Xoverlap = 1024 - 664 - 498; 
    const Yoverlap = 1024 - 180 - 135; 
    const xOffset = -(1024 * scale) + 80;
    const yOffset = -(1024 * scale) + 220;
    
    useEffect(() => {
        console.log("Loading");
        //Images here?
        const images = imgSource.map((src) => {
            const image = new Image();
            image.src = src;
            return image;
        });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.fillStyle = ["#4a9547", "lightblue", "#ffd16e", "pink"][theme];
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Loop through images and arrange them in a grid with overlap
        var scoreInc = 0;
        for (let row = 0; row < layout.length; row++) {
            for (let col = layout[row][0]; col <= layout[row][1]; col++) {
                // score + (5*(G=0,I=1,F=2,P=3))
                var imgIndex = (scores[scoreInc % scores.length] == 0 ? 0 : scores[scoreInc % scores.length] + 5*theme);
                //var imgIndex = (1 + Math.floor(Math.random() * 5) + 5*theme)
                scoreInc += 1;
                const image = images[imgIndex];

                const x = (col + ((row+offset) % 2) / 2) * ((image.width - Xoverlap) * scale);
                const y = (row)                 * ((image.height - Yoverlap) * scale);
                context.globalAlpha = 1; 
                context.drawImage(image, x + xOffset, y + yOffset, image.width * scale, image.height * scale);
            }
        }
    }, [scores, imgSource, theme])

    //if (!isLoaded) return <div>Loading</div>
    return (
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
    );
}