import { useMemo } from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import RenderList from './RenderList';
import React from 'react';
import styles from './MapSection.module.css'

export default function MapSection() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, });

  const [projectItems, setProjectItems] = React.useState(getProjects());

  const [eventItems, setEventItems] = React.useState(getEvents());
  const [displayEventItems, setDisplayEventItems] = React.useState(eventItems);



  return (
    <div className={styles['map-container']}>
      <div className={styles['map-banner-container']}>
        <MapBanner />
      </div>
      {!isLoaded ? <div>Loading</div> : <MapComponent />}

      <div className={`${styles['overlay-box']} ${styles['left-overlay']}`}>
        <h2 className={styles['overlay-title']}>Projects</h2>
        <RenderList items={projectItems} setItem={setProjectItems} type="project" />
      </div>

      <div className={`${styles['overlay-box']} ${styles['right-overlay']}`}>
        <h2 className={styles['overlay-title']}>Events</h2>
        <RenderList items={displayEventItems} setItem={setDisplayEventItems} type="event" />
      </div>
    </div>
  );
}

function MapBanner({ }) {
  return (
    <div className={styles['map-banner']}>
      <h2>Community Map</h2>
    </div>
  )
}

function MapComponent() {
  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);
  return (
    <GoogleMap
      zoom={10}
      center={center}
      mapContainerClassName={styles['map-container1']}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}


function getProjects(communityId) {
  return [
    {
      project_id: 1, id: 2, projectName: 'Project 1', startDate: '19/10/8', endDate: '24/11/9',
      description: 'Additional information for Project 1',
      isOpen: false
    },

    {
      project_id: 3, id: 4, projectName: 'Project 2', startDate: '40/11/26', endDate: '24/11/24',
      description: 'Additional information for Project 2 blah blah this is long --------------------asjkfalsdfljkaskl;dsj;asidfj;kl \\ \
      alks;djfasl;kdfjal;ksjdf',
      isOpen: false
    },

    {
      project_id: 5, id: 6, projectName: 'Long logn long long long long long long title Project 3', startDate: '123/11/26', endDate: '24/11/24',
      description: 'Additional information for Project 4f adsfasdfadsfasdfasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\
      asssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
      isOpen: false
    }
  ];
}

function getEvents(communityId) {
  return [
    {
      event_id: 1, id: 1, name: 'E1', project_id: 1,
      interestType: "Cats", startDateTime: "10:00am 19/10/11", duration: 1, price: 1,
      locationName: "Venue One", address: "162 either drive", booked: 5, capacity: 20, creator: "John",
      gpsLongitude: 1, gpsLatitude: 3,
      description: "An event about dogs"
    },

    {
      event_id: 2, id: 2, name: 'E2', project_id: 3,
      interestType: "Dogs", startDateTime: "3pm 31/3/1938", duration: 2, price: 1,
      locationName: "Venue Two", address: "54 drive drive", booked: 999, capacity: 999, creator: "Alex",
      gpsLongitude: 1, gpsLatitude: 3,
      description: "Alex's dog eventing"
    },

    {
      event_id: 3, id: 3, name: 'E3', project_id: 2,
      interestType: "Birds", startDateTime: "2pm 230/3/1", duration: 3, price: 1,
      locationName: "Ice", address: "91 court worth", booked: 1, capacity: 5, creator: "Sue",
      gpsLongitude: 1, gpsLatitude: 3,
      description: "Time to ice birds"
    },

    {
      event_id: 4, id: 4, name: 'E4', project_id: 4,
      interestType: "Fish", startDateTime: "25am 1/2/3", duration: 4, price: 1,
      locationName: "NewPlace", address: "11/1 county", booked: 0, capacity: 12, creator: "Jamess",
      gpsLongitude: 1, gpsLatitude: 3,
      description: "An event for fun and un fun"
    },
  ];
}