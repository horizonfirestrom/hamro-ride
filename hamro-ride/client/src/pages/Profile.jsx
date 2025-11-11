import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Phone, Mail, Car, Star, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, isDriver } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      color: '',
      licensePlate: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        vehicleInfo: {
          make: user.vehicleInfo?.make || '',
          model: user.vehicleInfo?.model || '',
          year: user.vehicleInfo?.year || '',
          color: user.vehicleInfo?.color || '',
          licensePlate: user.vehicleInfo?.licensePlate || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicleInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isDriver) {
        // Update driver profile including vehicle info
        const response = await axios.patch('/drivers/vehicle', formData.vehicleInfo);
        if (response.data.success) {
          toast.success('Vehicle information updated successfully');
        }
      }

      // Update user profile
      const response = await axios.patch('/auth/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      if (response.data.success) {
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      vehicleInfo: {
        make: user.vehicleInfo?.make || '',
        model: user.vehicleInfo?.model || '',
        year: user.vehicleInfo?.year || '',
        color: user.vehicleInfo?.color || '',
        licensePlate: user.vehicleInfo?.licensePlate || ''
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600 capitalize">{user?.role}</p>
              <div className="flex items-center justify-center mt-2">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{user?.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-3" />
                <span className="text-sm">{user?.phone}</span>
              </div>
              {isDriver && user?.vehicleInfo && (
                <div className="flex items-center text-gray-600">
                  <Car className="h-4 w-4 mr-3" />
                  <span className="text-sm">
                    {user.vehicleInfo.make} {user.vehicleInfo.model}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{user?.totalRides || 0}</p>
                  <p className="text-sm text-gray-600">Total Rides</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {user?.isOnline ? 'Online' : 'Offline'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input disabled:bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input disabled:bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input disabled:bg-gray-50"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Information (for drivers) */}
              {isDriver && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="make" className="form-label">
                        Make
                      </label>
                      <input
                        type="text"
                        id="make"
                        name="vehicleInfo.make"
                        value={formData.vehicleInfo.make}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input disabled:bg-gray-50"
                        placeholder="e.g., Toyota"
                      />
                    </div>

                    <div>
                      <label htmlFor="model" className="form-label">
                        Model
                      </label>
                      <input
                        type="text"
                        id="model"
                        name="vehicleInfo.model"
                        value={formData.vehicleInfo.model}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input disabled:bg-gray-50"
                        placeholder="e.g., Corolla"
                      />
                    </div>

                    <div>
                      <label htmlFor="year" className="form-label">
                        Year
                      </label>
                      <input
                        type="number"
                        id="year"
                        name="vehicleInfo.year"
                        value={formData.vehicleInfo.year}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input disabled:bg-gray-50"
                        placeholder="e.g., 2020"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    <div>
                      <label htmlFor="color" className="form-label">
                        Color
                      </label>
                      <input
                        type="text"
                        id="color"
                        name="vehicleInfo.color"
                        value={formData.vehicleInfo.color}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input disabled:bg-gray-50"
                        placeholder="e.g., White"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="licensePlate" className="form-label">
                        License Plate
                      </label>
                      <input
                        type="text"
                        id="licensePlate"
                        name="vehicleInfo.licensePlate"
                        value={formData.vehicleInfo.licensePlate}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="form-input disabled:bg-gray-50"
                        placeholder="e.g., BA 1 PA 1234"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;



