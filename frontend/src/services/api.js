const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_BASE_URL = rawUrl.replace(/\/+$/, '') + '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('bkl_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  registerViewer: async (email, password, fullName) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  },

  // Players
  getPlayers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.pool) query.append('pool', params.pool);
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.teamId) query.append('teamId', params.teamId);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/players?${query.toString()}`);
    return await res.json();
  },

  getPlayerById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/players/${id}`);
    return await res.json();
  },

  uploadUserPhoto: async (file) => {
    if (file.size > 1024 * 1024) {
      throw new Error("Profile image must be 1 MB or smaller.");
    }
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('bkl_token');
    const res = await fetch(`${API_BASE_URL}/auth/me/photo`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Photo upload failed');
    return data;
  },

  updateSelfPlayerType: async (playerType) => {
    const res = await fetch(`${API_BASE_URL}/players/self/type`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ playerType })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update player type');
    return data;
  },

  adminUpdatePlayer: async (playerId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/players/admin/${playerId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update player');
    return data;
  },

  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_BASE_URL}/teams`);
    return await res.json();
  },

  getTeamWithSquad: async (teamId) => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}`);
    return await res.json();
  },

  assignCaptain: async (teamId, captainUserId) => {
    const res = await fetch(`${API_BASE_URL}/teams/admin/assign-captain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teamId, captainUserId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign captain');
    return data;
  },

  resetTeamBudget: async (teamId, newBudget = 50000) => {
    const res = await fetch(`${API_BASE_URL}/teams/admin/${teamId}/reset-budget`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newBudget })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset budget');
    return data;
  },

  // Auction
  getAuctionState: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/current`);
    return await res.json();
  },

  placeBid: async (teamId, amount) => {
    const res = await fetch(`${API_BASE_URL}/auction/bid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teamId, amount })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place bid');
    return data;
  },

  startAuction: async (playerId) => {
    const res = await fetch(`${API_BASE_URL}/auction/start/${playerId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to start auction');
    return data;
  },

  pauseAuction: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/pause`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to pause auction');
    return data;
  },

  resumeAuction: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/resume`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resume auction');
    return data;
  },

  sellPlayer: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/sell`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sell player');
    return data;
  },

  markUnsold: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/unsold`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark unsold');
    return data;
  },

  reopenPlayer: async (playerId) => {
    const res = await fetch(`${API_BASE_URL}/auction/reopen/${playerId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reopen player');
    return data;
  },

  resetAuction: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/reset`, { method: 'POST', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset auction');
    return data;
  },

  revokePlayer: async (playerId) => {
    const res = await fetch(`${API_BASE_URL}/auction/revoke/${playerId}`, { method: 'POST', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke player');
    return data;
  },

  nextPlayer: async () => {
    const res = await fetch(`${API_BASE_URL}/auction/next`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to move to next player');
    return data;
  },

  // Dashboard & Admin
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return await res.json();
  },

  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers: getAuthHeaders() });
    return await res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getAuthHeaders() });
    return await res.json();
  },

  resetUserPassword: async (userId, newPassword) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  toggleUserActive: async (userId, active) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-active`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle user status');
    return data;
  }
};
