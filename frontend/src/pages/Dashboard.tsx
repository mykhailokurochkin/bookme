import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Welcome back! Here's your meeting room overview.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/bookings/new"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              📅 Create New Booking
            </Link>
            {isAdmin && (
              <Link
                to="/rooms/new"
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
              >
                🏢 Add Meeting Room
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md text-center"
            >
              🏠 Dashboard
            </Link>
            <Link
              to="/rooms"
              className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-center"
            >
              🏢 Meeting Rooms
            </Link>
            <Link
              to="/bookings"
              className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-center"
            >
              📅 My Bookings
            </Link>
            {isAdmin && (
              <Link
                to="/users"
                className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md text-center"
              >
                👥 Users
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
