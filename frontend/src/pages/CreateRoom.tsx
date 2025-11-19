import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { searchUsersByEmail } from '../api/usersClient.js';
import { createRoom } from '../api/roomsClient.js';
import type { MemberFormData, CreateRoomData } from '../types/rooms.js';

export const CreateRoom = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<MemberFormData[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'USER' | 'ADMIN'>('USER');
  const [debouncedEmail, setDebouncedEmail] = useState('');

  const { data: searchResults = [] } = useQuery({
    queryKey: ['searchUsers', debouncedEmail],
    queryFn: () => searchUsersByEmail(debouncedEmail),
    enabled: debouncedEmail.length > 2,
  });

  const debouncedSetEmail = useCallback(
    debounce((email: string) => {
      setDebouncedEmail(email);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetEmail(newMemberEmail);
  }, [newMemberEmail, debouncedSetEmail]);

  const createRoomMutation = useMutation({
    mutationFn: (roomData: CreateRoomData) => createRoom(roomData),
    onSuccess: () => {
      navigate('/rooms');
    },
  });

  const handleAddMember = () => {
    if (newMemberEmail && !members.find(m => m.email === newMemberEmail)) {
      setMembers([...members, { email: newMemberEmail, role: newMemberRole }]);
      setNewMemberEmail('');
      setNewMemberRole('USER');
    }
  };

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter(m => m.email !== email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roomData: CreateRoomData = {
      name,
      description,
      members,
    };

    createRoomMutation.mutate(roomData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Room</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room description (optional)"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Members (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">Search users by email address</p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
            
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as 'USER' | 'ADMIN')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-md p-2 bg-white max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-2">Found users:</p>
              {searchResults.map((user) => (
                <div key={user.id} className="text-sm text-gray-700 py-1">
                  {user.name} ({user.email})
                </div>
              ))}
            </div>
          )}

          {members.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Members to add:</h4>
              {members.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm">
                    {member.email} - <span className="font-medium">{member.role}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.email)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createRoomMutation.isPending || !name.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>

        {createRoomMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Error: {createRoomMutation.error.message}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
