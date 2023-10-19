import { useMemo } from 'react'
import { GoogleMap, useLoadScript, MarkerF, InfoWindow } from '@react-google-maps/api'
import RenderList from './RenderList';
import React from 'react';
import styles from './MapSection.module.css'
import { useEffect } from 'react';
import { getCommunityEvents, getCommunityProjects } from '@/pages/api/DataRequest';

/**
 * Returns a HTML element of a Map with two side bars
 *  - left side bar for projects
 *  - right side bar for events
 * @param communityData - data for currently loaded community 
 * @returns HTML
 */
export default function MapSection({ communityData }) {
  //Load script to use google maps api
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, });

  //use state to store array of projects associated with current community
  const [projectItems, setProjectItems] = React.useState([]);
  useEffect(() => { //Asyn function to get data
    async function getData() {
      const result = await getCommunityProjects(communityData.community_id);
      if (result != null) { setProjectItems(result.projects); }
      else { setProjectItems([]) }
    }
    getData();
  }, [communityData]);

  //Use state to store array of events associated with current community
  const [eventItems, setEventItems] = React.useState([]);
  useEffect(() => { //Asyn function to get data
    async function getData() {
      const result = await getCommunityEvents(communityData.community_id);
      if (result != null) {
        setEventItems(result.events);
      }
      else {
        setEventItems([])
      }
    }
    getData();
  }, [communityData]);


  return (
    <div className={styles['map-container']}>
      {/* Bottom sign */}
      <div className={styles['map-banner-container']}>
        <MapBanner />
      </div>
      {/* Google Maps with event markers*/}
      {!isLoaded ? <div>Loading...</div> : <MapComponent items={eventItems} setItems={setEventItems} />}

      {/* Left overlay for projects */}
      <div className={`${styles['overlay-box']} ${styles['left-overlay']}`}>
        <h2 className={styles['overlay-title']}>Projects</h2>
        <RenderList items={projectItems} setItem={setProjectItems} type="project" />
      </div>

      {/* RIght overlay for events */}
      <div className={`${styles['overlay-box']} ${styles['right-overlay']}`}>
        <h2 className={styles['overlay-title']}>Events</h2>
        <RenderList items={eventItems} setItem={setEventItems} type="event" />
      </div>
    </div>
  );
}

/**
 * BOttom sign to display "Community Map" 
 * @returns HTML
 */
function MapBanner({ }) {
  return (
    <div className={styles['map-banner']}>
      <h2>Community Map</h2>
    </div>
  )
}

/**
 * Display a map with clickable markers
 * @param items - list of events to display on map
 * @param setItems - used to make markers clickable and open on the right
 * @returns HTML
 */
function MapComponent({ items, setItems }) {
  const center = useMemo(() => ({ lat: -27.49058231111885, lng: 152.98770206796524 }), []);
  //Handler marker click
  const handleMarkerClick = (itemId) => {
    // Find the item by its unique id
    const updatedItems = items.map((item) => {
      return item.id === itemId ? { ...item, isOpen: true } : item
    });
    // Update the state with the modified items
    setItems(updatedItems);
  };

  return (
    <GoogleMap
      zoom={10}
      center={center}
      mapContainerClassName={styles['map-container1']}
    >
      {items.map((item, index) => (
        <div>
          <MarkerF
            key={index}
            position={{ lat: item.gps_latitude, lng: item.gps_longitude }}
            onClick={() => handleMarkerClick(item.id)}
            title={item.name}
          />
        </div>
      ))}
    </GoogleMap>
  );
}