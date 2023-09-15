import { useMemo } from 'react'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'

export default function MapSection() {
  const {isLoaded} = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <div>Loading</div>
  return (
    <div className='map-container'> 
        <h2>Map Section</h2>
        <MapComponent />
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