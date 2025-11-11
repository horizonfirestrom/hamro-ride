import { createContext, useContext, useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import axios from 'axios';

const MapsContext = createContext();

export const useMaps = () => {
  const context = useContext(MapsContext);
  if (!context) {
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
};

export const MapsProvider = ({ children }) => {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [google, setGoogle] = useState(null);
  const [map, setMap] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [distanceMatrixService, setDistanceMatrixService] = useState(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();
        setGoogle(google);
        setMapsLoaded(true);

        // Initialize services
        setAutocompleteService(new google.maps.places.AutocompleteService());
        setDirectionsService(new google.maps.DirectionsService());
        setDirectionsRenderer(new google.maps.DirectionsRenderer());
        setDistanceMatrixService(new google.maps.DistanceMatrixService());
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      loadGoogleMaps();
    }
  }, []);

  const initializeMap = (element, options = {}) => {
    if (!google || !element) return null;

    const defaultOptions = {
      zoom: 13,
      center: { lat: 27.7172, lng: 85.3240 }, // Kathmandu, Nepal
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    const mapInstance = new google.maps.Map(element, { ...defaultOptions, ...options });
    setMap(mapInstance);
    setPlacesService(new google.maps.places.PlacesService(mapInstance));
    return mapInstance;
  };

  const getPlacePredictions = async (input, options = {}) => {
    if (!autocompleteService || !google) return [];

    return new Promise((resolve, reject) => {
      autocompleteService.getPlacePredictions(
        {
          input,
          ...options
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions || []);
          } else {
            reject(new Error('Places request failed'));
          }
        }
      );
    });
  };

  const getPlaceDetails = async (placeId) => {
    if (!placesService || !google) return null;

    return new Promise((resolve, reject) => {
      placesService.getDetails(
        {
          placeId,
          fields: ['name', 'formatted_address', 'geometry', 'place_id']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            reject(new Error('Place details request failed'));
          }
        }
      );
    });
  };

  const calculateDistance = async (origin, destination) => {
    if (!distanceMatrixService || !google) return null;

    return new Promise((resolve, reject) => {
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            const result = response.rows[0].elements[0];
            resolve({
              distance: result.distance.value, // in meters
              duration: result.duration.value, // in seconds
              distanceText: result.distance.text,
              durationText: result.duration.text
            });
          } else {
            reject(new Error('Distance calculation failed'));
          }
        }
      );
    });
  };

  const getDirections = async (origin, destination) => {
    if (!directionsService || !google) return null;

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            resolve(result);
          } else {
            reject(new Error('Directions request failed'));
          }
        }
      );
    });
  };

  const renderDirections = (directionsResult) => {
    if (!directionsRenderer || !map) return;

    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(directionsResult);
  };

  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  };

  const addMarker = (position, options = {}) => {
    if (!google || !map) return null;

    const marker = new google.maps.Marker({
      position,
      map,
      ...options
    });

    return marker;
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const value = {
    mapsLoaded,
    google,
    map,
    autocompleteService,
    placesService,
    directionsService,
    directionsRenderer,
    distanceMatrixService,
    initializeMap,
    getPlacePredictions,
    getPlaceDetails,
    calculateDistance,
    getDirections,
    renderDirections,
    clearDirections,
    addMarker,
    getCurrentLocation
  };

  return (
    <MapsContext.Provider value={value}>
      {children}
    </MapsContext.Provider>
  );
};



