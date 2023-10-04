import { useMemo } from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import React from 'react';

export default function MapSection() {
  const {isLoaded} = useLoadScript({googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,});

  const [projectItems, setProjectItems] = React.useState(getProjects());
  const [eventItems, setEventItems] = React.useState([]);

  const toggleItem = (itemId, setItems) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  return (
    <div className='map-container'> 
      <h2>Map Section</h2>
      {!isLoaded ? <div>Loading</div> : <MapComponent />}

      <div className="overlay-box left-overlay">
        <h2 className='overlay-title'>Project Information</h2>
        {renderList(projectItems, setProjectItems, toggleItem)}
      </div>

      <div className="overlay-box right-overlay">
        <h2 className='overlay-title'>Event Information</h2>
        {renderList(eventItems, setEventItems, toggleItem)}
      </div>
    </div>
  );
}

function MapComponent() {
  const center = useMemo(() => ({lat: 44, lng: -80}), []);
  return (
    <GoogleMap 
      zoom={10} 
      center={center} 
      mapContainerClassName='map-container1'
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

//Get projects for relavant community
function getProjects(communityId) {
  return [
    { id: 1, name: 'Project 1', isOpen: false, info: 'Additional information for Project 1' },
    { id: 2, name: 'Project 2', isOpen: false, info: 'Additional information for Project 2' },
    { id: 3, name: 'Clan Meeting', isOpen: false, info: '- []' },
    { id: 4, name: 'Project 4', isOpen: false, info: 'Additional information for Project 2' },
    // Add more project items as needed
  ];
}

//Get 
function getEvents() {
  return [
    { id: 1, name: 'Event 1', isOpen: false, info: 'Additional information for Event 1' },
    { id: 2, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 3, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 4, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 5, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 6, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 7, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 8, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 9, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    { id: 10, name: 'Event 2', isOpen: false, info: 'Additional information for Event 2' },
    // Add more event items as needed
  ];
}

//
function renderList(items, setItems, toggleItem) {
  return (
    <ul className='side-list'>
      {items.map((item) => (
        <li key={item.id} className='list-item-container'>
          <div className='toggle-container'>
            {renderToggleBtn(item, setItems, toggleItem)}
            <span className="item-name">{item.name}</span>
          </div>
          <div className="additional-info">{item.isOpen && <div>{item.info}</div>}</div>
        </li>
      ))}
    </ul>
  )
}

function renderToggleBtn(item, setItems, toggleItem) {
  return (
    <div className={`toggle-button ${item.isOpen ? 'filled' : 'unfilled'}`} onClick={() => toggleItem(item.id, setItems)}>
      <div className="circle"></div>
    </div>
  )
}