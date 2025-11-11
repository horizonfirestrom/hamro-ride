import { useState, useEffect, useRef } from 'react';
import { useMaps } from '../contexts/MapsContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Navigation, Clock, DollarSign, Car } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const RideRequest = () => {
  const { mapsLoaded, initializeMap, getPlacePredictions, getPlaceDetails, calculateDistance } = useMaps();
  const { requestRide, currentRide } = useSocket();
  const { user } = useAuth();
  
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [pickup, setPickup] = useState({ address: '', coordinates: null });
  const [dropoff, setDropoff] = useState({ address: '', coordinates: null });
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (mapsLoaded && mapRef.current) {
      const mapInstance = initializeMap(mapRef.current, {
        center: { lat: 27.7172, lng: 85.3240 }, // Kathmandu, Nepal
        zoom: 13
      });
      setMap(mapInstance);
    }
  }, [mapsLoaded, initializeMap]);

  useEffect(() => {
    if (pickup.coordinates && dropoff.coordinates) {
      calculateFare();
    }
  }, [pickup.coordinates, dropoff.coordinates]);

  const handlePickupChange = async (value) => {
    setPickup({ ...pickup, address: value });
    
    if (value.length > 2) {
      try {
        const predictions = await getPlacePredictions(value, {
          location: new google.maps.LatLng(27.7172, 85.3240),
          radius: 50000
        });
        setPickupSuggestions(predictions);
        setShowPickupSuggestions(true);
      } catch (error) {
        console.error('Error fetching pickup suggestions:', error);
      }
    } else {
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    }
  };

  const handleDropoffChange = async (value) => {
    setDropoff({ ...dropoff, address: value });
    
    if (value.length > 2) {
      try {
        const predictions = await getPlacePredictions(value, {
          location: new google.maps.LatLng(27.7172, 85.3240),
          radius: 50000
        });
        setDropoffSuggestions(predictions);
        setShowDropoffSuggestions(true);
      } catch (error) {
        console.error('Error fetching dropoff suggestions:', error);
      }
    } else {
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    }
  };

  const selectPickup = async (prediction) => {
    try {
      const place = await getPlaceDetails(prediction.place_id);
      setPickup({
        address: place.formatted_address,
        coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
      });
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
      toast.error('Error getting location details');
    }
  };

  const selectDropoff = async (prediction) => {
    try {
      const place = await getPlaceDetails(prediction.place_id);
      setDropoff({
        address: place.formatted_address,
        coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
      });
      setDropoffSuggestions([]);
      setShowDropoffSuggestions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
      toast.error('Error getting location details');
    }
  };

  const calculateFare = async () => {
    if (!pickup.coordinates || !dropoff.coordinates) return;

    try {
      const result = await calculateDistance(
        { lat: pickup.coordinates[1], lng: pickup.coordinates[0] },
        { lat: dropoff.coordinates[1], lng: dropoff.coordinates[0] }
      );

      setDistance(result.distance);
      setDuration(result.duration);

      // Calculate fare (base fare + per km + per minute)
      const baseFare = 50; // Rs. 50 base fare
      const perKmRate = 15; // Rs. 15 per km
      const perMinuteRate = 2; // Rs. 2 per minute
      
      const distanceKm = result.distance / 1000;
      const durationMinutes = result.duration / 60;
      
      const calculatedFare = baseFare + (distanceKm * perKmRate) + (durationMinutes * perMinuteRate);
      setFare(Math.round(calculatedFare));
    } catch (error) {
      console.error('Error calculating fare:', error);
      toast.error('Error calculating fare');
    }
  };

  const handleRequestRide = async () => {
    if (!pickup.coordinates || !dropoff.coordinates) {
      toast.error('Please select both pickup and dropoff locations');
      return;
    }

    if (!distance || !duration) {
      toast.error('Please wait for fare calculation');
      return;
    }

    setRequesting(true);

    try {
      const rideData = {
        pickup: {
          address: pickup.address,
          coordinates: pickup.coordinates
        },
        dropoff: {
          address: dropoff.address,
          coordinates: dropoff.coordinates
        },
        distance,
        duration,
        fare: {
          baseFare: 50,
          perKmRate: 15,
          perMinuteRate: 2,
          total: fare
        }
      };

      // Request ride through socket
      requestRide(rideData);
      
      toast.success('Ride request sent to nearby drivers!');
    } catch (error) {
      console.error('Error requesting ride:', error);
      toast.error('Error requesting ride');
    } finally {
      setRequesting(false);
    }
  };

  if (!mapsLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select your route</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <div ref={mapRef} className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Ride Details */}
        <div className="space-y-6">
          {/* Pickup Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h3>
            <div className="relative">
              <input
                type="text"
                value={pickup.address}
                onChange={(e) => handlePickupChange(e.target.value)}
                onFocus={() => setShowPickupSuggestions(true)}
                className="form-input"
                placeholder="Enter pickup location"
              />
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {pickupSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectPickup(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">{suggestion.structured_formatting.main_text}</p>
                          <p className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dropoff Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dropoff Location</h3>
            <div className="relative">
              <input
                type="text"
                value={dropoff.address}
                onChange={(e) => handleDropoffChange(e.target.value)}
                onFocus={() => setShowDropoffSuggestions(true)}
                className="form-input"
                placeholder="Enter destination"
              />
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {dropoffSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectDropoff(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <Navigation className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">{suggestion.structured_formatting.main_text}</p>
                          <p className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ride Summary */}
          {(pickup.coordinates && dropoff.coordinates) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{distance ? `${(distance / 1000).toFixed(1)} km` : 'Calculating...'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{duration ? `${Math.round(duration / 60)} min` : 'Calculating...'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Fare</span>
                  <span className="font-bold text-lg text-primary-600">Rs. {fare}</span>
                </div>
              </div>

              <button
                onClick={handleRequestRide}
                disabled={requesting || !fare}
                className="w-full mt-6 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requesting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Requesting Ride...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Car className="h-5 w-5 mr-2" />
                    Request Ride
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Current Ride Status */}
          {currentRide && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Ride</h3>
              <p className="text-blue-700">
                {currentRide.status === 'pending' ? 'Looking for drivers...' :
                 currentRide.status === 'accepted' ? 'Driver on the way' :
                 currentRide.status === 'arrived' ? 'Driver has arrived' :
                 'Ride in progress'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideRequest;



