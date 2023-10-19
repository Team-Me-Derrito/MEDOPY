import React, { useEffect, useRef } from 'react';
import { generatePerlinNoise } from 'perlin-noise'
import RenderList from './RenderList';
import styles from './GameSection.module.css'
import { IMAGE_SOURCES } from '@/public/constants/ImagePaths';
import { getCommunities, getCommunityInterests, getCommunityPosts } from '@/pages/api/DataRequest';

/**
 * Game section to display:
 *      Tree game, 
 *      Side board to display community interests and frequency on the left
 *      Message board on the right
 *      Buttons to: Toggle boards visibility, Theme and size buttons
 * @param communityData - Loaded information for currently selected community
 * @param communityID - ID of community to load data for (Not loaded from server)
 * @param setCommunityID - Function to set community ID to load data for
 * @param isize - initial grid size of grid
 * @returns HTML as described above
 */
export default function GameSection({ communityData, communityID, setCommunityID, isize }) {
    //Control theme
    const [theme, setTheme] = React.useState(0);
    function changeTheme(change) { setTheme((theme + change + 4) % 4); }

    //Control grid size (set #rows and columns is calculated to fit)
    const [rowSize, setRowSize] = React.useState(isize * 2 + 1);
    function changeSize(change) { setRowSize((rowSize + 2 * change + 100) % 100) }

    //Toggle information display
    const [infoDisplay, setInfoDisplay] = React.useState(true);
    function toggleInfoDisplay() { setInfoDisplay(!infoDisplay) }

    //Store infomation items in state and update when community is changed
    const [infoItems, setInfoItems] = React.useState([]);
    //Use effect that retrieves messages every 5seconds
    useEffect(() => {
        async function getData() {
            const result = await getCommunityInterests(communityData.community_id);
            if (result != null) { setInfoItems(result.interests); } //TODOValues??
        }
        getData();
    }, [communityData]);

    //Toggle message board display
    const [messageDisplay, setMessageDisplay] = React.useState(true);
    function toggleMessageDiplay() { setMessageDisplay(!messageDisplay) }

    //Store message items in state and update when community is changed / poll every 5seconds
    const [messageItems, setMessageItems] = React.useState([]);
    useEffect(() => {
        async function getData() {
            const result = await getCommunityPosts(communityData.community_id);
            if (result != null) { setMessageItems(result.posts); }
        }
        getData();
        //Poll for new messages every 5seconds
        const fetchDataInterval = setInterval(getData, 5000);
        return () => {
            clearInterval(fetchDataInterval);
        };
    }, [communityData]);

    //Load data for all communities -> used for drop down menu
    const [communities, setCommunities] = React.useState([]);
    useEffect(() => { //Asyn function to get data
        async function getData() {
            const result = await getCommunities();
            if (result != null) { setCommunities(result.communities); }
            else { setCommunities([]) }
        }
        if (!communities.length) { getData(); }
    }, []);

    return (
        <div className={styles['game-container']}>
            {/*Top Banner sign*/}
            <div className={styles['game-banner-container']}>
                <GameBanner
                    communityData={communityData}
                    communityID={communityID}
                    setCommunityID={setCommunityID}
                />
            </div>
            {/*Tree Game display*/}
            <GameDisplay
                scores={communityData == null ? [] : communityData.scores}
                theme={theme} rowSize={rowSize} />

            {/*Info Display on left*/}
            {infoDisplay &&
                <div className={`${styles['overlay-box']} ${styles['left-overlay']}`}>
                    <h2 className={styles['overlay-title']}>Community Interests</h2>
                    <RenderList items={infoItems} setItem={setInfoItems} type="community_info" />
                </div>
            }

            {/*Chat Display on right*/}
            {messageDisplay &&
                <div className={`${styles['overlay-box']} ${styles['right-overlay']}`}>
                    <h2 className={styles['overlay-title']}>Community Messages</h2>
                    <RenderList items={messageItems} setItem={setMessageItems} type="message" />
                </div>
            }

            {/* Buttons and Dropdown*/}
            <div className={styles['game-button-container']}>
                {/* Change theme buttons */}
                <button className={styles['b1']} onClick={() => changeTheme(-1)}>⬅</button>
                <button className={styles['b2']} onClick={() => changeTheme(1)}>➡</button>
                {/* Change grid size buttons */}
                <button className={styles['b3']} onClick={() => changeSize(1)}>+</button>
                <button className={styles['b4']} onClick={() => changeSize(-1)}>
                    <div className={styles['b4-1']}>-</div>
                </button>
                {/* Toggle information button */}
                <button className={styles['b5']} onClick={() => toggleInfoDisplay()}>
                    <div className={styles['b5-1']}>🛈</div>
                </button>
                {/* Toggle chat button */}
                <button className={styles['b6']} onClick={() => toggleMessageDiplay()}>
                    <div className={styles['b6-1']}>💬</div>
                </button>
                {/* <button className={styles['b6']} onClick={() => refresh()}>
                    <div className={styles['b6-1']}>---</div>
                </button> */}
                {/* Change selected community drop down menu */}
                <DropdownMenu currentID={communityID} setID={setCommunityID} options={communities} />
            </div>
        </div>
    );
}

/**
 * Function to display game banner
 * @param communityData - Data for currently loaded community 
 * @returns HTML of banner in a hanging sign
 */
function GameBanner({ communityData }) {
    return (
        <div className={styles['game-banner']}>
            <h2>{communityData.community_name}</h2>
        </div >
    )
}


/**
 * Function to display dropdown menu of communities
 * @param currentID - ID of community to display
 * @param setID - set ID of community to display
 * @param options - list of communities
 * @returns HTML
 */
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


/**
 * Function to store stage of game and asnychornously update it when a dependant state is changed
 * @param scores - score array of community
 * @param theme
 * @param rowSize
 * @returns 
 */
function GameDisplay({ scores, theme, rowSize }) {
    //Varaible to only set permutation once on load
    const [firstLoad, setFirstLoad] = React.useState(0);

    //Varaible to store permutation of scores to display
    const [displayScores, setDisplayScores] = React.useState([]);
    function setPermutate(scores, rows, cols) {
        setDisplayScores(permuteScores(scores, rows, cols))
    }

    //Variable to store number of coloumns
    const [colSize, setColSize] = React.useState(1);
    function updateColSize(newCol, reload) {
        if (reload || colSize != newCol) {
            setColSize(newCol)
            setPermutate(scores, rowSize, colSize)
        }
    }

    //Use state to update scores if community is changed
    useEffect(() => { //Asyn function to get data
        if (scores != null) {
            setDisplayScores(setPermutate(scores, rowSize, colSize))
        }
        setDisplayScores([])
        setFirstLoad(0)
    }, [scores]);

    //Canvas to display tree game
    const canvasRef = useRef(null);
    //Use state to reload canvas on change
    useEffect(() => {
        const images = IMAGE_SOURCES.map((src, index) => {
            const image = new Image();
            image.src = src;
            image.onload = () => {
                //Might need to reload a few times to actually work
                //This is a hot fix to bug that the cause is not known
                if (firstLoad < 8) {
                    setPermutate(scores, rowSize, colSize)
                }
                setFirstLoad(firstLoad + 1)
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

        //Reload game on resize and refresh
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('refresh', resizeCanvas);
        return () => { window.removeEventListener('resize', resizeCanvas); };
    }, [displayScores, theme, rowSize, colSize])

    return (
        <div className={styles['canvas-container']}>
            <canvas ref={canvasRef} />
        </div>
    );
}

/**
 * Function to size and draw images onto game canvas
 * @param {*} canvas - canvas to draw trees onto
 * @param {*} images - images of trees to use
 * @param {*} theme  - currently selected theme
 * @param {*} rowSize - number of rows selected by user
 * @param {*} col     - number of columns (derived)
 * @param {*} updateColSize - function to update number of columns
 * @param {*} scores - permuted scores array to display
 */
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

    //Hard coded values:
    const finalRow = rowSize;
    const imageSize = 1024;
    const Xoverlap = 1024 - 664 - 498;
    const Yoverlap = 1024 - 180 - 135;

    //Calculate scale and number of columns based on screen size and number of rows
    const scale = (canvas.height / ((imageSize - Yoverlap) * (finalRow) + Yoverlap)) * 0.99;
    const finalCol = Math.floor(((canvas.width / scale) - Xoverlap) / (imageSize - Xoverlap));
    if (finalCol != col) { updateColSize(finalCol, false) }

    //Image adjustment values
    const effectiveWidth = scale * (imageSize - Xoverlap);
    const effectiveHeight = scale * (imageSize - Yoverlap);
    const xOffset = (canvas.width - (effectiveWidth * (finalCol) + scale * Xoverlap)) / 2;
    const yOffset = (canvas.height - (effectiveHeight * (finalRow) + scale * Yoverlap)) / 4;

    //Variable to keep track of location in score array
    let scoreInc = 0;
    //Place images in grid
    for (let row = 0; row < finalRow; row++) {
        for (let col = 0; col < finalCol; col++) {
            //Skip the final column and the corners
            if ((row % 2 == 1 && col + 1 == finalCol) || (row == 0 && col == 0) ||
                (row == 0 && col + 1 == finalCol) || (row + 1 == finalRow && col == 0) ||
                (row + 1 == finalRow && col + 1 == finalCol)) { continue }
            //Load image based on score and theme
            const imgIndex = (scores[scoreInc % scores.length] == 0 ? 0 : scores[scoreInc % scores.length] + 5 * theme);
            scoreInc += 1;
            const image = images[imgIndex] ?? images[0];
            let x = (col + ((row % 2) / 2)) * effectiveWidth;
            let y = row * effectiveHeight;
            context.drawImage(image, x + xOffset, y + yOffset, image.width * scale, image.height * scale);
        }
    }
}

/**
 * User perlin noise to generate clustering of high scores on 2d grid
 * @param {*} scores - score array to permute
 * @param {*} n      - number of rows
 * @param {*} m      - number of columns
 * @returns a permuted score array
 */
function permuteScores(scores, n, m) {
    if (scores == null || n == 0 || m == 0) {
        return [];
    }
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
    const scoreArray = integerArray.map(indexAtIndex => (sortedScores.length > indexAtIndex ? sortedScores[indexAtIndex] : 0));
    const intArray = scoreArray.map(floatNumber => {
        const result = Math.min(5, Math.max(0, Math.round(floatNumber)));
        return result;
    });
    return intArray;
}