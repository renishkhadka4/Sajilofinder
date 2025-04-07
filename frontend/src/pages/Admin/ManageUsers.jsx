import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from "../../components/AdminSiderbar";
import '../../styles/ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/admin/all-users/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId) => {
    try {
      await axios.patch(`http://localhost:8000/api/admin/all-users/${userId}/block/`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters when users data or filter values change
    const applyFilters = () => {
      let result = [...users];
      
      if (filters.role) {
        result = result.filter(user => user.role === filters.role);
      }
      
      if (filters.status !== '') {
        const isActive = filters.status === 'active';
        result = result.filter(user => user.is_active === isActive);
      }
      
      setFilteredUsers(result);
    };
    
    applyFilters();
  }, [users, filters]);

  // Get unique roles for the dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        <div className="admin-users-panel">
          <header className="panel-header">
            <h2>Manage Users</h2>
            <div className="user-stats">
              <span>Total Users: {users.length}</span>
              <span>Filtered: {filteredUsers.length}</span>
            </div>
          </header>

          <div className="filter-controls">
            <div className="filter-item">
              <label htmlFor="role-filter">Filter by Role:</label>
              <select 
                id="role-filter" 
                name="role" 
                value={filters.role} 
                onChange={handleFilterChange}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="status-filter">Filter by Status:</label>
              <select 
                id="status-filter" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <button 
              className="clear-filters-btn" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <div className="loading-indicator">Loading users...</div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => {
                      const fullName =
                        user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : user.email;

                      return (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{fullName}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-indicator ${user.is_active ? 'active' : 'blocked'}`}>
                              {user.is_active ? 'Active' : 'Blocked'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`action-btn ${user.is_active ? 'block-btn' : 'unblock-btn'}`}
                              onClick={() => toggleBlock(user.id)}
                            >
                              {user.is_active ? 'Block' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No users match the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;