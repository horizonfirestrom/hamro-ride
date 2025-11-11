import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  Car, 
  MapPin, 
  Clock, 
  Star, 
  Navigation, 
  Phone,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isDriver } = useAuth();
  const { currentRide, nearbyRides } = useSocket();
  const [stats, setStats] = useState({
    totalRides: 0,
    rating: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/rides/my-rides?limit=1');
      if (response.data.success) {
        setStats({
          totalRides: user.totalRides || 0,
          rating: user.rating || 0,
          totalEarnings: 0 // This would need to be calculated from completed rides
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isDriver ? 'Ready to pick up passengers?' : 'Where would you like to go today?'}
        </p>
      </div>

      {/* Current Ride Status */}
      {currentRide && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentRide.status === 'pending' ? 'Looking for drivers...' : 
                   currentRide.status === 'accepted' ? 'Driver on the way' :
                   currentRide.status === 'arrived' ? 'Driver has arrived' :
                   currentRide.status === 'started' ? 'Ride in progress' : 'Ride completed'}
                </h3>
                <p className="text-gray-600">
                  {currentRide.pickup?.address} → {currentRide.dropoff?.address}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentRide.status === 'pending' && (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Waiting</span>
                </div>
              )}
              {currentRide.status === 'accepted' && (
                <div className="flex items-center text-blue-600">
                  <Navigation className="h-5 w-5 mr-1" />
                  <span className="text-sm">En route</span>
                </div>
              )}
              {currentRide.status === 'arrived' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Arrived</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {!isDriver ? (
          <>
            <Link
              to="/request-ride"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Request Ride</h3>
                  <p className="text-gray-600">Book a ride to your destination</p>
                </div>
              </div>
            </Link>

            <Link
              to="/ride-history"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-secondary-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ride History</h3>
                  <p className="text-gray-600">View your past rides</p>
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/driver-dashboard"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full">
                  <Car className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Driver Dashboard</h3>
                  <p className="text-gray-600">Manage your driving activities</p>
                </div>
              </div>
            </Link>

            {nearbyRides.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Navigation className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {nearbyRides.length} Ride{nearbyRides.length > 1 ? 's' : ''} Available
                    </h3>
                    <p className="text-gray-600">Nearby ride requests</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Link
          to="/profile"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-secondary-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-gray-600">Manage your account</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-full">
              <Car className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalRides}</h3>
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
              <h3 className="text-2xl font-bold text-gray-900">{stats.rating.toFixed(1)}</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>

        {isDriver && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">Rs. {stats.totalEarnings}</h3>
                <p className="text-gray-600">Total Earnings</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Your recent rides will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



