
import React, { useEffect, useRef } from 'react';
import MapSection from "@/components/MapSection";
import GameSection from "@/components/GameSection";

//Todo:
//Change to get all communities -> select one

//Clickable icons

//Pull data from backend
//Function to generate scores and resize grid
//Fix loading issue
//Overlap map data
//Clickable Icons
//Use a dictionary

import { SCORE_0, SCORE_1, SCORE_2 } from "@/public/constants/ExampleData.js";
import { getCommunityInfo, getCommunityProjects, getCommunityPosts } from './api/DataRequest.js'

export default function Home() {
  //Current selected Community
  const [communityID, setCommunityID] = React.useState(2);

  //Get all data for given community (use -1 to have no community set + place holder)
  const [communityData, setCommunityData] = React.useState({ community_id: -1, community_name: "loading..." });
  useEffect(() => { //Asyn function to get data
    async function getData() {
      const result = await getCommunityInfo(communityID);
      setCommunityData(result);
    }
    if (communityData.community_id != communityID) { getData(); }
  }, [communityID]);

  const [scoresArray, setScoresArray] = React.useState([]);
  useEffect(() => {
      async function getData() {
          const result = SCORE_1 //await getCommunityScores(communityID);
          setScoresArray(result);
      }
      if (scoresArray == null || !scoresArray.length) {
          getData(); // Initial data fetch
      }
  }, [communityID]);


  return (
    <div>
      <GameSection
        communityData={communityData}
        communityID={communityID}
        setCommunityID={setCommunityID}
        scores={SCORE_1} isize={6}
      />
      <MapSection communityID={communityID} />
    </div>
  );
}