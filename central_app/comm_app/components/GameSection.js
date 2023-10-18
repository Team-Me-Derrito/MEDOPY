import React, { useEffect, useRef } from 'react';
import styles from './GameSection.module.css'
import { generatePerlinNoise } from 'perlin-noise'
import { IMAGE_SOURCES } from '@/public/constants/ImagePaths';
import RenderList from './RenderList';
import { getCommunities, getCommunityPosts } from '@/pages/api/DataRequest';


const communities = [
    { community_id: 1, community_name: 'Community 1' },
    { community_id: 2, community_name: 'This is the second' },
    { community_id: 3, community_name: 'The thrid' },
];

//Improve game banner
export default function GameSection({ communityData, communityID, setCommunityID, scores, isize }) {
    //Use state and function to control theme
    const [theme, setTheme] = React.useState(0);
    function changeTheme(change) { setTheme((theme + change + 4) % 4); }

    //Use state and function to change size
    const [rowSize, setRowSize] = React.useState(isize * 2 + 1);
    function changeSize(change) { setRowSize((rowSize + 2 * change + 100) % 100) }

    //Use state and function to toggle message board
    const [messageDisplay, setMessageDisplay] = React.useState(true);
    function toggleMessageDiplay() { setMessageDisplay(!messageDisplay) }

    //Use state and use effect to get all communities for drop down menu
    const [communities, setCommunities] = React.useState([]);
    useEffect(() => { //Asyn function to get data
      async function getData() {
        const result = await getCommunities();
        if (result != null) {
            setCommunities(result.communities);
        }
      }
      if (!communities.length) { getData(); }
    }, []);

    //Use state to retrieve message items
    const [messageItems, setMessageItems] = React.useState([]);
    //Use effect that retrieves messages every 5seconds
    useEffect(() => {
        async function getData() {
            const result = await getCommunityPosts(communityID);
            console.log('Run')
            if (result != null) {
                setMessageItems(result.posts);
            }
        }
        if (messageItems == null || !messageItems.length) {
            getData(); // Initial data fetch
        }
        const fetchDataInterval = setInterval(getData, 5000); // Fetch data every 10 seconds
        return () => {
            clearInterval(fetchDataInterval);
        };
    }, [communityID]);

    return (
        <div className={styles['game-container']}>
            {/*Top Banner*/}
            <div className={styles['game-banner-container']}>
                <GameBanner
                    communityData={communityData}
                    communityID={communityID}
                    setCommunityID={setCommunityID}
                />
            </div>
            {/*Tree Game*/}
            <GameDisplay scores={scores} theme={theme} rowSize={rowSize} />
            {/*Chat Display*/}
            {messageDisplay &&
                <div className={`${styles['overlay-box']} ${styles['right-overlay']}`}>
                    <h2 className={styles['overlay-title']}>Community Messages</h2>
                    <RenderList items={messageItems} setItem={setMessageItems} type="message" />
                </div>
            }
            {/* Buttons and Dropdown*/}
            <div className={styles['game-button-container']}>
                <button className={styles['b1']} onClick={() => changeTheme(-1)}>⬅</button>
                <button className={styles['b2']} onClick={() => changeTheme(1)}>➡</button>
                <button className={styles['b3']} onClick={() => changeSize(1)}>+</button>
                <button className={styles['b4']} onClick={() => changeSize(-1)}>
                    <div className={styles['b4-1']}>-</div>
                </button>
                <button className={styles['b5']} onClick={() => toggleMessageDiplay()}>
                    <div className={styles['b5-1']}>💬</div>
                </button>
                <DropdownMenu currentID={communityID} setID={setCommunityID} options={communities} />
            </div>
        </div>
    );
}

function GameBanner({ communityData }) {
    return (
        <div className={styles['game-banner']}>
            <h2>{communityData.community_name}</h2>
        </div >
    )
}

function DropdownMenu({ currentID, setID, options }) {
    const handleSelectChange = (event) => {
        const communityID = event.target.value;
        setID(communityID);
    };
    return (
        <div className={styles['dropdown-container']}>
            <select className={styles['dropdown-select']} value={currentID} onChange={handleSelectChange}>
                {options.map((option) => (
                    <option className={styles['dropdown-option']} key={option.community_id} value={option.community_id}>
                        {option.community_name}
                    </option>
                ))}
            </select>
        </div>
    )
}

//Take in an array of numbers -> re order to have in display order
function GameDisplay({ scores, theme, rowSize }) {
    //Varaible lock grid permuatation
    const [firstLoad, setFirstLoad] = React.useState(true);
    //Varaible to store permutation of scores
    const [displayScores, setDisplayScores] = React.useState(scores);
    function setPermutate(scores, rows, cols) {
        setDisplayScores(permuteScores(scores, rows, cols))
    }

    //Variable to store number of coloumns ->
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
        </div>
    );
}

function updateCanvas(canvas, images, theme, rowSize, col, updateColSize, scores) {
    //Canvas size
    const canvasContainer = canvas.parentElement;
    canvas.width = canvasContainer.clientWidth;
    const effWidth = canvasContainer.clientWidth;
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


//Functions used for testing
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

function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}



function getCommunityPostsTest(communityId) {
    if (communityId == 1) {
        return [
            { message_id: 1, sender: "J1m", message: "I like dogs" },
            { message_id: 2, sender: "J.2", message: "I don't like cats" },
            { message_id: 3, sender: "J3remy", message: "123 one two three" },
            { message_id: 4, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 5, sender: "J4ck", message: "This is the fourth message" },
        ];
    } else if (communityId == 2) {
        return [
            { message_id: 1, sender: "J1m", message: "I like dogs" },
            { message_id: 2, sender: "J.2", message: "I don't like cats" },
            { message_id: 3, sender: "J3remy", message: "123 one two three" },
            { message_id: 4, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 5, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 6, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 7, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 8, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 9, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 10, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 11, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 12, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 13, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 14, sender: "J4ck", message: "This is the fourth message" },
            { message_id: 15, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
            { message_id: 16, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
            { message_id: 17, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
            { message_id: 18, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
            { message_id: 19, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
            { message_id: 20, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
        ];
    }

    return [
        { message_id: 18, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
        { message_id: 19, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
        { message_id: 20, sender: "J4ck", message: "This is the fourth messageas jdhkjajds hfjklahdf;ja sd;jf;ljas;ldk fj;asj;dsf;k jds;fk;lj" },
    ];


}