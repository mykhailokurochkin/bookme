import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getRoomById } from '../api/roomsClient';
import { MemberManagement } from '../components/MemberManagement';

export const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room', id],
    queryFn: () => getRoomById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            Room not found or failed to load.
          </div>
          <Link
            to="/rooms"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/rooms"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Rooms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
          {room.description && (
            <p className="mt-2 text-gray-600">{room.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">📅 Created:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="text-sm">👤 Created by:</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {room.creator?.name || room.creator?.email || room.createdBy}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex gap-4">
                    <Link
                      to="/bookings/new"
                      state={{ roomId: room.id }}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors text-center"
                    >
                      Book This Room
                    </Link>
                    <Link
                      to="/rooms"
                      className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors text-center"
                    >
                      Browse Other Rooms
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <MemberManagement roomId={id!} isAdmin={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
