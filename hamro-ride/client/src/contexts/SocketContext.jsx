import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [nearbyRides, setNearbyRides] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: document.cookie.split('token=')[1]?.split(';')[0]
        },
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Ride-related events
      newSocket.on('ride-request', (rideData) => {
        console.log('New ride request:', rideData);
        setNearbyRides(prev => [rideData, ...prev]);
        toast.success(`New ride request from ${rideData.rider.name}`);
      });

      newSocket.on('ride-accepted', (data) => {
        console.log('Ride accepted:', data);
        setCurrentRide(prev => ({ ...prev, ...data, status: 'accepted' }));
        toast.success(`Ride accepted by ${data.driver.name}`);
      });

      newSocket.on('ride-status-updated', (data) => {
        console.log('Ride status updated:', data);
        setCurrentRide(prev => ({ ...prev, status: data.status }));
        toast.info(`Ride status: ${data.status}`);
      });

      newSocket.on('ride-cancelled', (data) => {
        console.log('Ride cancelled:', data);
        setCurrentRide(null);
        toast.error('Ride was cancelled');
      });

      newSocket.on('no-drivers-found', (data) => {
        console.log('No drivers found:', data);
        toast.error('No drivers available nearby');
      });

      newSocket.on('driver-location-update', (data) => {
        console.log('Driver location update:', data);
        // Handle driver location updates for active rides
      });

      newSocket.on('ride-taken', (data) => {
        console.log('Ride taken:', data);
        setNearbyRides(prev => prev.filter(ride => ride.rideId !== data.rideId));
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'An error occurred');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Cleanup when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const requestRide = (rideData) => {
    if (socket && connected) {
      socket.emit('request-ride', rideData);
    }
  };

  const acceptRide = (rideId) => {
    if (socket && connected) {
      socket.emit('accept-ride', { rideId });
    }
  };

  const updateRideStatus = (rideId, status) => {
    if (socket && connected) {
      socket.emit('ride-status-update', { rideId, status });
    }
  };

  const cancelRide = (rideId, reason) => {
    if (socket && connected) {
      socket.emit('cancel-ride', { rideId, reason });
    }
  };

  const updateLocation = (coordinates) => {
    if (socket && connected) {
      socket.emit('location-update', { coordinates });
    }
  };

  const updateDriverStatus = (isAvailable, location) => {
    if (socket && connected) {
      socket.emit('driver-status', { isAvailable, location });
    }
  };

  const shareLocation = (rideId, coordinates) => {
    if (socket && connected) {
      socket.emit('share-location', { rideId, coordinates });
    }
  };

  const value = {
    socket,
    connected,
    currentRide,
    nearbyRides,
    setCurrentRide,
    requestRide,
    acceptRide,
    updateRideStatus,
    cancelRide,
    updateLocation,
    updateDriverStatus,
    shareLocation
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

