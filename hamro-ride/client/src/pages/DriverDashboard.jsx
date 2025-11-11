import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useMaps } from '../contexts/MapsContext';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Navigation, 
  Phone,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { nearbyRides, acceptRide, updateRideStatus, updateDriverStatus, updateLocation } = useSocket();
  const { getCurrentLocation } = useMaps();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current location on component mount
    getCurrentLocation()
      .then(loc => {
        setLocation(loc);
        updateLocation([loc.lng, loc.lat]);
      })
      .catch(error => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location');
      });
  }, [getCurrentLocation, updateLocation]);

  const toggleAvailability = async () => {
    setLoading(true);
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      
      if (location) {
        updateDriverStatus(newStatus, {
          coordinates: [location.lng, location.lat]
        });
      }
      
      toast.success(newStatus ? 'You are now available for rides' : 'You are now offline');
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error updating availability');
      setIsAvailable(!isAvailable); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      acceptRide(rideId);
      setCurrentRide({ rideId, status: 'accepted' });
      toast.success('Ride accepted successfully');
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Error accepting ride');
    }
  };

  const handleUpdateRideStatus = async (status) => {
    if (!currentRide) return;
    
    try {
      updateRideStatus(currentRide.rideId, status);
      setCurrentRide(prev => ({ ...prev, status }));
      toast.success(`Ride status updated to ${status}`);
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Error updating ride status');
    }
  };

  const handleCompleteRide = () => {
    handleUpdateRideStatus('completed');
    setCurrentRide(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your driving activities</p>
      </div>

      {/* Status Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
              <Car className={`h-6 w-6 ${isAvailable ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isAvailable ? 'Available for rides' : 'Offline'}
              </h3>
              <p className="text-gray-600">
                {isAvailable ? 'You will receive ride requests' : 'You will not receive ride requests'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isAvailable 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } disabled:opacity-50`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              isAvailable ? 'Go Offline' : 'Go Online'
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Current Ride */}
        {currentRide && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Ride</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentRide.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  currentRide.status === 'arrived' ? 'bg-purple-100 text-purple-800' :
                  currentRide.status === 'started' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentRide.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateRideStatus('arrived')}
                  disabled={currentRide.status !== 'accepted'}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Arrived
                </button>
                
                <button
                  onClick={() => handleUpdateRideStatus('started')}
                  disabled={currentRide.status !== 'arrived'}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Ride
                </button>
                
                <button
                  onClick={handleCompleteRide}
                  disabled={currentRide.status !== 'started'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Ride
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Available Rides */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Rides ({nearbyRides.length})
          </h3>
          
          {nearbyRides.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ride requests available</p>
              <p className="text-sm text-gray-400">Ride requests will appear here when available</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {nearbyRides.map((ride, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{ride.rider.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 mr-1" />
                          {ride.rider.rating}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptRide(ride.rideId)}
                      className="btn-primary text-sm"
                    >
                      Accept
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Navigation className="h-4 w-4 mr-2" />
                      <span className="truncate">{ride.pickup.address}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{ride.dropoff.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{Math.round(ride.duration / 60)} min</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="font-medium">Rs. {ride.fare}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Car className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{user?.totalRides || 0}</h3>
              <p className="text-gray-600">Total Rides</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{user?.rating?.toFixed(1) || '0.0'}</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">Rs. 0</h3>
              <p className="text-gray-600">Today's Earnings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;



