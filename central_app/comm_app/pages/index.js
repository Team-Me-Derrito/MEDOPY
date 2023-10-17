import React from "react";
import MapSection from "@/components/MapSection";
import GameSection from "@/components/GameSection";


//Todo:
//Pull data from backend
//Function to generate scores and resize grid
//Fix loading issue
//Overlap map data
//Clickable Icons
//Use a dictionary


import { SCORE_0, SCORE_1, SCORE_2 } from "@/public/constants/ExampleData.js";
// import { getAllEvents } from './api/DataRequest.js'
//   var test = getAllEvents();
//   console.log(test);
//Implement Banner to display community name and health


import { getCommunityInfo, getCommunityProjects, getCommunityPosts } from './api/DataRequest.js'
//   var test = getAllEvents();
//   console.log(test);


//


export default function Home() {
  //Get all data here fore
  const [community, setCommunity] = React.useState(getCommunityInfoTEST(1));

  function updateCommunity(community_id) {
      setCommunity(getCommunityInfoTEST(community_id))
  }
  
  var test = getCommunityInfo(2);
  console.log(test);

  return (
    <div>
      <GameSection community={community} updateCommunity={updateCommunity} scores={SCORE_1} isize={6} />
      <MapSection />
    </div>
  );
}


function getCommunityInfoTEST(id) {
  return {communityName: "TestCommunity", health: 500}
}