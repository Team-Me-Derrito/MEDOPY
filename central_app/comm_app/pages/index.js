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
import { getAllEvents } from './api/DataRequest.js'

//Implement Banner to display community name and health

export default function Home() {
  // var test = getAllEvents();
  // console.log(test);

  return (
    <div> 
      <GameSection scores={SCORE_1} isize={6}/>
      <MapSection />
    </div>
  );
}