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

const imgSource =  [
  '/images/GameImages/Tile1.png',

  '/images/GameImages/G01.png',
  '/images/GameImages/G11.png',
  '/images/GameImages/G21.png',
  '/images/GameImages/G31.png',
  '/images/GameImages/G41.png',

  '/images/GameImages/I01.png',
  '/images/GameImages/I11.png',
  '/images/GameImages/I21.png',
  '/images/GameImages/I31.png',
  '/images/GameImages/I41.png',

  '/images/GameImages/F01.png',
  '/images/GameImages/F11.png',
  '/images/GameImages/F21.png',
  '/images/GameImages/F31.png',
  '/images/GameImages/F41.png',

  '/images/GameImages/P01.png',
  '/images/GameImages/P11.png',
  '/images/GameImages/P21.png',
  '/images/GameImages/P31.png',
  '/images/GameImages/P41.png'
];

const scores0 = [
    0, 0, 0,
  0, 1, 2, 0,
 1, 3, 3, 2, 0,
  3, 4, 3, 1,
 2, 5, 4, 4, 2,
  3, 4, 5, 2,
 1, 1, 3, 3, 1,
  0, 2, 1, 2,
   0, 0, 0
];

const scores1 = [
   0, 0, 0,
  0, 0, 0, 0,
 0, 0, 1, 2, 0,
  0, 2, 1, 0,
 0, 3, 3, 1, 0,
  1, 1, 2, 0,
 0, 1, 2, 1, 0,
  0, 0, 0, 0,
   0, 0, 0
];

export default function Home() {
  return (
    <div> 
      <GameSection scores={scores0} imgSource={imgSource}/>
      <MapSection />
    </div>
  );
}