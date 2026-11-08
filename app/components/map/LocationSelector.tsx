import { FC, useState } from "react";
import MapSelector from "./Map";

interface Location {
  location: { lat: number; lng: number };
  setLocation: (location: { lat: number; lng: number }) => void;
}

const LocationSelector: FC<Location> = ({ location, setLocation }) => {
  const handleLocationSelected = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  return (
    <MapSelector
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      onLocationSelected={handleLocationSelected}
      lat={location.lat}
      lng={location.lng}
    />
  );
};

export default LocationSelector;
