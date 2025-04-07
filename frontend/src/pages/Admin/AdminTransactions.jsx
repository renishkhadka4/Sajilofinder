import React, { useEffect, useState } from "react";
import api from "../../api/axios";

import { toast } from "react-toastify";
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/AdminTransactions.css';

const AdminTransactions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/transactions/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(res.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load transactions");
      setLoading(false);
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedPayments = [...payments].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Filter payments based on search term
  const filteredPayments = sortedPayments.filter(
    (payment) =>
      payment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.hostel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "status-success";
      case "pending":
        return "status-pending";
      case "failed":
        return "status-failed";
      default:
        return "status-default";
    }
  };

  return (
    <div className="admin-transactions-container">
        <AdminSidebar />
      {/* We assume AdminSidebar is already rendered at parent level */}
      <div className="admin-transactions-content">
        <div className="admin-transactions-inner">
          <div className="transactions-header">
            <h1>Transactions</h1>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button onClick={fetchPayments} className="refresh-button">
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading transactions...</div>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("student_name")}>
                      Student
                      {sortConfig.key === "student_name" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("student_email")}>
                      Email
                      {sortConfig.key === "student_email" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("hostel_name")}>
                      Hostel
                      {sortConfig.key === "hostel_name" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("amount")}>
                      Amount
                      {sortConfig.key === "amount" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("transaction_id")}>
                      Transaction ID
                      {sortConfig.key === "transaction_id" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("status")}>
                      Status
                      {sortConfig.key === "status" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("payment_method")}>
                      Method
                      {sortConfig.key === "payment_method" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                    <th onClick={() => requestSort("created_at")}>
                      Date
                      {sortConfig.key === "created_at" && (
                        <span className="sort-indicator">{sortConfig.direction === "asc" ? " ↑" : " ↓"}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.student_name}</td>
                      <td>{payment.student_email}</td>
                      <td>{payment.hostel_name}</td>
                      <td>Rs. {Number(payment.amount).toFixed(2)}</td>
                      <td className="transaction-id">{payment.transaction_id}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{payment.payment_method}</td>
                      <td>{new Date(payment.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="transactions-summary">
            <p>Total Transactions: {filteredPayments.length}</p>
            {filteredPayments.length > 0 && (
              <p>
                Total Amount: Rs.{" "}
                {filteredPayments
                  .reduce((sum, payment) => sum + Number(payment.amount), 0)
                  .toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;