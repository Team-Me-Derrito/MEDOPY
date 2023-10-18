import { useMemo } from 'react'
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import RenderList from './RenderList';
import React from 'react';
import styles from './MapSection.module.css'
import { useEffect } from 'react';
import { getCommunityEvents, getCommunityProjects } from '@/pages/api/DataRequest';

export default function MapSection({ communityID }) {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, });

  const [projectItems, setProjectItems] = React.useState([]);
  useEffect(() => { //Asyn function to get data
    async function getData() {
      const result = await getCommunityProjects(communityID);
      if (result != null) {
        setProjectItems(result.projects);
      }
    }
    if (!projectItems.length) {
      getData();
    }
  }, [communityID]);

  const [eventItems, setEventItems] = React.useState([]);
  useEffect(() => { //Asyn function to get data
    async function getData() {
      const result = await getCommunityEvents(communityID);
      console.log(result)
      if (result != null) {
        setEventItems(result.events);
      }
    }
    if (!eventItems.length) {
      getData();
    }
  }, [communityID]);

  const [displayEventItems, setDisplayEventItems] = React.useState(eventItems);

  return (
    <div className={styles['map-container']}>
      <div className={styles['map-banner-container']}>
        <MapBanner />
      </div>
      {!isLoaded ? <div>Loading...</div> : <MapComponent locations={eventItems} />}

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

function MapComponent({ locations }) {
  const center = useMemo(() => ({ lat: -27.49058231111885, lng: 152.98770206796524 }), []);
  const locations1 = locations;
  return (
    <GoogleMap
      zoom={10}
      center={center}
      mapContainerClassName={styles['map-container1']}
    >
      {/* <MarkerF position={center} /> */}

      {locations1.map((location, index) => (
        <MarkerF
          key={index}
          position={{ lat: location['gpsLatitude'], lng: location['gpsLongitude'] }}
        />
      ))}
    </GoogleMap>
  );
}


function getProjects(communityId) {
  if (communityId == 1) {
    [
      {
        project_id: 1, id: 2, projectName: 'Project 1', startDate: '19/10/8', endDate: '24/11/9',
        description: 'Additional information for Project 1',
        isOpen: false
      }
    ]
  }

  if (communityId != 2) {
    return [];
  }




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
      event_id: 1, id: 2, name: 'E1', project_id: 11,
      interestType: "Cats", startDateTime: "10:00am 19/10/11", duration: 1, price: 1,
      locationName: "Venue One", address: "162 either drive", booked: 5, capacity: 20, creator: "John",
      gpsLatitude: -27.49058231111885, gpsLongitude: 152.98771206796524,
      description: "An event about dogs"
    },

    {
      event_id: 3, id: 4, name: 'E2', project_id: 12,
      interestType: "Dogs", startDateTime: "3pm 31/3/1938", duration: 2, price: 1,
      locationName: "Venue Two", address: "54 drive drive", booked: 999, capacity: 999, creator: "Alex",
      gpsLatitude: -27.49058231111885, gpsLongitude: 153.08770306796524,
      description: "Alex's dog eventing"
    },

    {
      event_id: 5, id: 6, name: 'E3', project_id: 13,
      interestType: "Birds", startDateTime: "2pm 230/3/1", duration: 3, price: 1,
      locationName: "Ice", address: "91 court worth", booked: 1, capacity: 5, creator: "Sue",
      gpsLatitude: -27.49058231111885, gpsLongitude: 153.00780206796524,
      description: "Time to ice birds"
    },

    {
      event_id: 7, id: 8, name: 'E4', project_id: 14,
      interestType: "Fish", startDateTime: "25am 1/2/3", duration: 4, price: 1,
      locationName: "NewPlace", address: "11/1 county", booked: 0, capacity: 12, creator: "Jamess",
      gpsLatitude: -27.50058231111885, gpsLongitude: 152.99770206796524,
      description: "An event for fun and un fun"
    },

    {
      event_id: 9, id: 10, name: 'The love shack', project_id: 15,
      interestType: "Men", startDateTime: "1/1/1", duration: 999, price: 0,
      locationName: "A shack of love", address: "[REDACTED]", booked: 2, capacity: 2, creator: "---",
      gpsLatitude: -27.49058231111885, gpsLongitude: 153.01770206796524,
      description: "An event"
    },
  ];
}