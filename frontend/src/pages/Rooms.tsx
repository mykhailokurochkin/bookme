import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getRooms, type MeetingRoom } from '../api/roomsClient';

export const Rooms = () => {
  const { data: rooms = [], isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            Failed to load rooms. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Rooms</h1>
            <p className="mt-2 text-gray-600">
              Browse and book available meeting rooms
            </p>
          </div>
          <Link
            to="/rooms/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Create New Room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="py-8">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms available</h3>
            <p className="text-gray-600 mb-4">
              There are currently no meeting rooms configured.
            </p>
            <Link
              to="/rooms/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Your First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: MeetingRoom) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {room.name}
                  </h3>

                  {room.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-sm">📅 Created {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="text-sm">👤 {room.members?.length || 0} members</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/rooms/${room.id}`}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      to="/bookings/new"
                      state={{ roomId: room.id }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
