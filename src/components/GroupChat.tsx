import React, { useState } from 'react';
import './GroupChat.css';

interface GroupMember {
  publicKey: string;
  name: string;
  isOnline: boolean;
  role: 'admin' | 'member';
}

interface GroupInfo {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  createdAt: number;
  memberCount: number;
}

interface GroupChatProps {
  groups: GroupInfo[];
  currentGroup: string | null;
  onCreateGroup: (name: string, description: string) => void;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onSelectGroup: (groupId: string) => void;
  onInviteMember: (groupId: string, publicKey: string) => void;
  onRemoveMember: (groupId: string, publicKey: string) => void;
  userPublicKey: string;
}

const GroupChat: React.FC<GroupChatProps> = ({
  groups,
  currentGroup,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  onSelectGroup,
  onInviteMember,
  onRemoveMember,
  userPublicKey
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [invitePublicKey, setInvitePublicKey] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupDescription.trim());
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
    }
  };

  const handleInviteMember = () => {
    if (currentGroup && invitePublicKey.trim()) {
      onInviteMember(currentGroup, invitePublicKey.trim());
      setInvitePublicKey('');
      setShowInviteForm(false);
    }
  };

  const handleJoinGroup = () => {
    if (joinGroupId.trim()) {
      onJoinGroup(joinGroupId.trim());
      setJoinGroupId('');
    }
  };

  const isUserAdmin = (group: GroupInfo): boolean => {
    const userMember = group.members.find(m => m.publicKey === userPublicKey);
    return userMember?.role === 'admin';
  };

  const currentGroupInfo = groups.find(g => g.id === currentGroup);

  return (
    <div className="group-chat-container">
      <div className="group-header">
        <h3 className="group-title">🔒 Secure Groups</h3>
        <div className="group-actions">
          <button 
            className="action-btn create-btn"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Create
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Create New Group</h4>
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="form-input"
            />
            <textarea
              placeholder="Group description (optional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              className="form-textarea"
            />
            <div className="modal-actions">
              <button 
                className="action-btn cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn confirm-btn"
                onClick={handleCreateGroup}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Invite Member</h4>
            <input
              type="text"
              placeholder="Member's public key"
              value={invitePublicKey}
              onChange={(e) => setInvitePublicKey(e.target.value)}
              className="form-input"
            />
            <div className="modal-actions">
              <button 
                className="action-btn cancel-btn"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn confirm-btn"
                onClick={handleInviteMember}
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="join-group-section">
        <div className="join-input-container">
          <input
            type="text"
            placeholder="Enter group ID to join"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            className="join-input"
          />
          <button 
            className="action-btn join-btn"
            onClick={handleJoinGroup}
          >
            Join
          </button>
        </div>
      </div>

      <div className="groups-list">
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No groups yet</p>
            <p className="empty-subtext">Create or join a group to start secure group conversations</p>
          </div>
        ) : (
          groups.map((group) => (
            <div 
              key={group.id}
              className={`group-item ${currentGroup === group.id ? 'active' : ''}`}
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="group-info">
                <div className="group-name">{group.name}</div>
                <div className="group-stats">
                  <span className="member-count">👥 {group.memberCount} members</span>
                  <span className="online-count">
                    🟢 {group.members.filter(m => m.isOnline).length} online
                  </span>
                </div>
                {group.description && (
                  <div className="group-description">{group.description}</div>
                )}
              </div>
              
              <div className="group-actions-menu">
                {isUserAdmin(group) && (
                  <button 
                    className="action-btn invite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGroup(group.id);
                      setShowInviteForm(true);
                    }}
                  >
                    👤+
                  </button>
                )}
                <button 
                  className="action-btn leave-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Leave group "${group.name}"?`)) {
                      onLeaveGroup(group.id);
                    }
                  }}
                >
                  🚪
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {currentGroupInfo && (
        <div className="group-members-panel">
          <h4 className="members-title">
            Group Members ({currentGroupInfo.memberCount})
          </h4>
          <div className="members-list">
            {currentGroupInfo.members.map((member) => (
              <div key={member.publicKey} className="member-item">
                <div className="member-info">
                  <span className={`status-indicator ${member.isOnline ? 'online' : 'offline'}`} />
                  <span className="member-name">{member.name}</span>
                  {member.role === 'admin' && <span className="admin-badge">👑</span>}
                </div>
                
                {isUserAdmin(currentGroupInfo) && member.publicKey !== userPublicKey && (
                  <button 
                    className="action-btn remove-btn"
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from group?`)) {
                        onRemoveMember(currentGroupInfo.id, member.publicKey);
                      }
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="security-notice">
        <span className="security-icon">🔒</span>
        <span>All group messages use Signal Protocol with perfect forward secrecy</span>
      </div>
    </div>
  );
};

export default GroupChat;
