import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

const MapComponent = ({ address }: { address: string }) => {
    const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    };

    // Fetch latitude and longitude using the Google Geocoding API
    const geocodeAddress = async () => {
        const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY as string;
        console.log('API Key:', apiKey);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                    address
                )}&key=${apiKey}`
            );
            const data = await response.json();
            console.log('Geocoding data:', data);
            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setPosition({ lat, lng });
            } else {
                console.error('Geocoding failed:', data.status);
            }
        } catch (error) {
            console.error('Error fetching geocode:', error);
        }
    };

    useEffect(() => {
        if (address) {
            geocodeAddress();
        }
    }, [address]);

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={16}
                center={position || { lat: 0, lng: 0 }} // Center the map on the position if available
            >
                {position && <Marker position={position} />}
            </GoogleMap>
        </LoadScript>
    );
};

export default MapComponent;