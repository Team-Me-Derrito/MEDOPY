import React, { useEffect } from 'react';
import MapSection from "@/components/MapSection";
import GameSection from "@/components/GameSection";
import { getCommunityInfo } from './api/DataRequest.js'

/**
 * Home Screen (and only screen) load selected community data
 * Displays Game section and Map section
 * @returns 
 */
export default function Home() {
  //Set ID for community to be loaded in
  const [communityID, setCommunityID] = React.useState(1);

  //Information for current community 
  const [communityData, setCommunityData] = React.useState({ community_id: -1, community_name: "loading..." });
  //Load info for current community and update when selected community is changed
  useEffect(() => { 
    async function getData() {
      const result = await getCommunityInfo(communityID);
      if (result != null) { setCommunityData(result); }
    }
    if (communityData.community_id != communityID) { getData(); }
  }, [communityID]);

  //Main display consisting of top part the game and bottom part the map
  return (
    <div>
      <GameSection
        communityData={communityData}
        communityID={communityID}
        setCommunityID={setCommunityID}
        isize={3}
      />
      <MapSection communityData={communityData} />
    </div>
  );
}