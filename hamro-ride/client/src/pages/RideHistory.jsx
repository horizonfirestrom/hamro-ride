import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, MapPin, Clock, Star, Phone, Navigation } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RideHistory = () => {
  const { user, isDriver } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRides();
  }, [filter]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/rides/my-rides?status=${filter === 'all' ? '' : filter}`);
      if (response.data.success) {
        setRides(response.data.rides);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      toast.error('Error loading ride history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'arrived':
        return 'bg-purple-100 text-purple-800';
      case 'started':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  const formatDistance = (meters) => {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ride History</h1>
        <p className="text-gray-600 mt-2">View your past and current rides</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Rides
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'cancelled' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-6">
        {rides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't taken any rides yet" 
                : `No ${filter} rides found`}
            </p>
          </div>
        ) : (
          rides.map((ride) => (
            <div key={ride._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <Car className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isDriver ? `Ride with ${ride.rider?.name}` : `Ride with ${ride.driver?.name}`}
                    </h3>
                    <p className="text-gray-600">{formatDate(ride.requestedAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)}`}>
                  {ride.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Route */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Navigation className="h-4 w-4 mr-3 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{ride.pickup.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">{ride.dropoff.address}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{formatDistance(ride.distance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{formatDuration(ride.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fare</span>
                    <span className="font-bold text-lg text-primary-600">Rs. {ride.fare.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment</span>
                    <span className="font-medium capitalize">{ride.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Driver/Rider Info */}
              {ride.driver && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{ride.driver.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 mr-1" />
                          {ride.driver.rating}
                          {ride.driver.vehicleInfo && (
                            <span className="ml-2">
                              • {ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {ride.driver.phone && (
                      <a
                        href={`tel:${ride.driver.phone}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Call Driver
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Ratings */}
              {(ride.riderRating || ride.driverRating) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    {ride.riderRating && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Rider Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < ride.riderRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill={i < ride.riderRating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {ride.driverRating && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Driver Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < ride.driverRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill={i < ride.driverRating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RideHistory;



