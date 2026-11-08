import React, { useState, useRef, useEffect, useCallback, FC } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface MapSelectorProps {
  apiKey: string;
  onLocationSelected: (lat: number, lng: number) => void;
  lat: number;
  lng: number;
}

const render = (status: Status) => {
  if (status === Status.LOADING) return <div>Loading...</div>;
  if (status === Status.FAILURE) return <div>Error loading maps</div>;
  return <></>;
};

const MapSelector: FC<MapSelectorProps> = ({
  apiKey,
  onLocationSelected,
  lat,
  lng,
}) => {
  return (
    <Wrapper apiKey={apiKey} render={render}>
      <Map onLocationSelected={onLocationSelected} lat={lat} lng={lng} />
    </Wrapper>
  );
};

const Map: FC<{
  onLocationSelected: (lat: number, lng: number) => void;
  lat: number;
  lng: number;
}> = ({ onLocationSelected, lat, lng }) => {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>();
  const [markerCluster, setMarkerClusters] = useState<MarkerClusterer>();
  const [marker, setMarker] = useState<
    { lat: number; lng: number } | undefined
  >();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center: { lat: lat, lng: lng },
          zoom: 5,
        })
      );
    }
    if (map && !markerCluster) {
      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const { lat, lng } = e.latLng;
          setMarker({ lat: lat(), lng: lng() });
          onLocationSelected(lat(), lng());
        }
      });
      setMarkerClusters(new MarkerClusterer({ map, markers: [] }));
    }
  }, [lat, lng, map, markerCluster, onLocationSelected]);

  useEffect(() => {
    if (marker && markerCluster) {
      markerCluster.clearMarkers();
      markerCluster.addMarker(
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
        })
      );
    }
  }, [marker, markerCluster]);

  useEffect(() => {
    if (map && markerCluster) {
      setMarker((prev) => {
        if (prev && prev.lat === lat && prev.lng === lng) {
          return prev;
        }
        return { lat, lng };
      });
      map.setCenter({ lat: lat, lng: lng });
    }
  }, [lat, lng, map, markerCluster]);

  return (
    <div
      ref={ref as any}
      style={{ height: "500px", width: "100%", borderRadius: "12px" }}
    ></div>
  );
};

export default MapSelector;
