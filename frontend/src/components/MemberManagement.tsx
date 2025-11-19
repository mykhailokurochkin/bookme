import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchUsersByEmail } from '../api/usersClient.js';
import {
  getRoomMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from '../api/membersClient.js';
import type { MemberManagementProps } from '../types/rooms.js';

export const MemberManagement = ({ roomId, isAdmin }: MemberManagementProps) => {
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'USER' | 'ADMIN'>('USER');
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['roomMembers', roomId],
    queryFn: () => getRoomMembers(roomId),
  });

  const { data: searchResults = [], refetch: searchUsers } = useQuery({
    queryKey: ['searchUsers', newMemberEmail],
    queryFn: () => searchUsersByEmail(newMemberEmail),
    enabled: false,
  });

  const addMemberMutation = useMutation({
    mutationFn: (memberData: { email: string; role?: 'USER' | 'ADMIN' }) => 
      addMember(roomId, memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
      setShowAddMember(false);
      setNewMemberEmail('');
      setNewMemberRole('USER');
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
      updateMemberRole(roomId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
      setEditingMember(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => removeMember(roomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomMembers', roomId] });
    },
  });

  const handleAddMember = () => {
    if (newMemberEmail && !members.find(m => m.user.email === newMemberEmail)) {
      addMemberMutation.mutate({ email: newMemberEmail, role: newMemberRole });
    }
  };

  const handleEmailSearch = () => {
    if (newMemberEmail.length > 2) {
      searchUsers();
    }
  };

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveMember = (userId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Room Members</h3>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {showAddMember ? 'Cancel' : 'Add Member'}
          </button>
        </div>
      )}

      {showAddMember && isAdmin && (
        <div className="bg-gray-50 p-4 rounded-md space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Add New Member</h4>
          
          <div className="flex gap-2">
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onBlur={handleEmailSearch}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter email address"
            />
            
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value as 'USER' | 'ADMIN')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            
            <button
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending || !newMemberEmail}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="p-2 bg-white rounded-md border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Found users:</p>
              {searchResults.map((user) => (
                <div key={user.id} className="text-xs text-gray-700">
                  {user.name} ({user.email})
                </div>
              ))}
            </div>
          )}

          {addMemberMutation.error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-xs">
                Error: {addMemberMutation.error.message}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {members.length > 0 ? (
          members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {member.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {member.user.email}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  editingMember === member.user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user.id, e.target.value as 'USER' | 'ADMIN')}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={() => setEditingMember(null)}
                        className="text-green-600 hover:text-green-700 text-xs"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingMember(null)}
                        className="text-gray-600 hover:text-gray-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                      <button
                        onClick={() => setEditingMember(member.user.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.user.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                        disabled={removeMemberMutation.isPending}
                      >
                        {removeMemberMutation.isPending ? '...' : 'Remove'}
                      </button>
                    </>
                  )
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    member.role === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No members added yet</p>
        )}
      </div>

      {updateRoleMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            Error: {updateRoleMutation.error.message}
          </p>
        </div>
      )}

      {removeMemberMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            Error: {removeMemberMutation.error.message}
          </p>
        </div>
      )}
    </div>
  );
};
