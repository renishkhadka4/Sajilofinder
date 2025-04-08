import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSiderbar'; // Fixed typo in import
import '../../styles/ManageUsers.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify'; // Assuming you have this for notifications

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
  });

  // API base URL as a constant
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  // Get auth token - extracted as a function for reusability
  const getAuthToken = () => localStorage.getItem('token');

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/all-users/`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      if (res.data) {
        setUsers(res.data);
        setFilteredUsers(res.data);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(res.data.length / prev.itemsPerPage)
        }));
        toast.success('Users loaded successfully');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const toggleBlock = async (userId) => {
    try {
      const currentUser = users.find(user => user.id === userId);
      
      await axios.patch(`${API_BASE_URL}/admin/all-users/${userId}/block/`, {}, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      toast.success(`User ${currentUser.is_active ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (err) {
      console.error('Error blocking/unblocking user:', err);
      toast.error('Failed to update user status. Please try again.');
    }
  };

  // Handle search and filter operations
  useEffect(() => {
    const applyFiltersAndSearch = () => {
      let result = [...users];
      
      // Apply role filter
      if (filters.role) {
        result = result.filter(user => user.role === filters.role);
      }
      
      // Apply status filter
      if (filters.status !== '') {
        const isActive = filters.status === 'active';
        result = result.filter(user => user.is_active === isActive);
      }
      
      // Apply search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        result = result.filter(user => 
          (user.first_name && user.first_name.toLowerCase().includes(term)) ||
          (user.last_name && user.last_name.toLowerCase().includes(term)) ||
          user.email.toLowerCase().includes(term)
        );
      }
      
      setFilteredUsers(result);
      setPagination(prev => ({
        ...prev,
        currentPage: 1, // Reset to first page when filters change
        totalPages: Math.ceil(result.length / prev.itemsPerPage)
      }));
    };
    
    applyFiltersAndSearch();
  }, [users, filters, searchTerm]);

  // Initial data load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Get unique roles for the dropdown
  const uniqueRoles = [...new Set(users.map(user => user.role))].sort();

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
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        currentPage: newPage
      }));
    }
  };

  const changeItemsPerPage = (e) => {
    const value = parseInt(e.target.value);
    setPagination(prev => ({
      itemsPerPage: value,
      currentPage: 1, // Reset to first page
      totalPages: Math.ceil(filteredUsers.length / value)
    }));
  };

  // Calculate pagination indexes
  const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Export functions
  const exportToExcel = () => {
    const data = filteredUsers.map(user => ({
      Name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
      Email: user.email,
      Role: user.role,
      Status: user.is_active ? 'Active' : 'Blocked',
      // Add more fields as needed
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Add timestamp to filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    XLSX.writeFile(workbook, `Users_Report_${timestamp}.xlsx`);
    toast.success('Excel report generated successfully');
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Add title
      doc.setFontSize(16);
      doc.text('User Management Report', 14, 15);
      
      // Add timestamp
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 14, 20);
      
      const tableColumn = ["#", "Full Name", "Email", "Role", "Status"];
      const tableRows = [];

      filteredUsers.forEach((user, index) => {
        const fullName = user.first_name || user.last_name 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : 'N/A';

        tableRows.push([
          index + 1,
          fullName,
          user.email,
          user.role,
          user.is_active ? "Active" : "Blocked"
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [51, 51, 51] },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      doc.save(`users-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
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
          
          <div className="search-export-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            
            <div className="export-buttons">
              <button onClick={exportToExcel} className="export-btn excel-btn">
                <i className="fa fa-file-excel-o"></i> Export to Excel
              </button>
              <button onClick={exportToPDF} className="export-btn pdf-btn">
                <i className="fa fa-file-pdf-o"></i> Export to PDF
              </button>
            </div>
          </div>
          
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
              disabled={!filters.role && !filters.status && !searchTerm}
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : (
            <>
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
                    {currentItems.length > 0 ? (
                      currentItems.map((user, index) => {
                        const fullName =
                          user.first_name || user.last_name
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'N/A';

                        return (
                          <tr key={user.id}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td className="user-name">{fullName}</td>
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
              
              {/* Pagination controls */}
              {filteredUsers.length > 0 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                  </div>
                  
                  <div className="items-per-page">
                    <label>
                      Show 
                      <select value={pagination.itemsPerPage} onChange={changeItemsPerPage}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                      entries
                    </label>
                  </div>
                  
                  <div className="pagination-buttons">
                    <button 
                      onClick={() => changePage(1)} 
                      disabled={pagination.currentPage === 1}
                      className="pagination-btn"
                    >
                      First
                    </button>
                    <button 
                      onClick={() => changePage(pagination.currentPage - 1)} 
                      disabled={pagination.currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    
                    <span className="pagination-pages">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button 
                      onClick={() => changePage(pagination.currentPage + 1)} 
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                    <button 
                      onClick={() => changePage(pagination.totalPages)} 
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="pagination-btn"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;