import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import AdminSidebar from '../../components/AdminSiderbar';
import '../../styles/AdminTransactions.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFileExcel, FaFilePdf, FaSync, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Separate components for better organization
const StatusBadge = ({ status }) => {
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
    <span className={`status-badge ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
};

const TransactionTable = ({ 
  transactions, 
  sortConfig, 
  requestSort, 
  isLoading 
}) => {
  if (isLoading) {
    return <div className="loading-state" aria-live="polite">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state" aria-live="polite">
        <p>No transactions found.</p>
      </div>
    );
  }

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <FaSortAmountUp className="sort-icon" /> : <FaSortAmountDown className="sort-icon" />;
    }
    return null;
  };

  return (
    <div className="transactions-table-container">
      <table className="transactions-table" aria-label="Transactions">
        <thead>
          <tr>
            {[
              { key: "student_name", label: "Student" },
              { key: "student_email", label: "Email" },
              { key: "hostel_name", label: "Hostel" },
              { key: "amount", label: "Amount" },
              { key: "transaction_id", label: "Transaction ID" },
              { key: "status", label: "Status" },
              { key: "payment_method", label: "Method" },
              { key: "created_at", label: "Date" }
            ].map(column => (
              <th 
                key={column.key} 
                onClick={() => requestSort(column.key)}
                aria-sort={sortConfig.key === column.key ? sortConfig.direction : "none"}
                className={sortConfig.key === column.key ? "active-sort" : ""}
              >
                <div className="th-content">
                  {column.label}
                  {getSortIndicator(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.student_name}</td>
              <td>{payment.student_email}</td>
              <td>{payment.hostel_name}</td>
              <td>Rs. {Number(payment.amount).toFixed(2)}</td>
              <td className="transaction-id">{payment.transaction_id}</td>
              <td>
                <StatusBadge status={payment.status} />
              </td>
              <td>{payment.payment_method}</td>
              <td>{new Date(payment.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TransactionSummary = ({ transactions }) => {
  const totalAmount = useMemo(() => {
    return transactions
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
      .toFixed(2);
  }, [transactions]);

  return (
    <div className="transactions-summary">
      <div className="summary-stats">
        <div className="summary-item">
          <span className="summary-label">Total Transactions:</span>
          <span className="summary-value">{transactions.length}</span>
        </div>
        
        {transactions.length > 0 && (
          <div className="summary-item">
            <span className="summary-label">Total Amount:</span>
            <span className="summary-value">Rs. {totalAmount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
const AdminTransactions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [exportLoading, setExportLoading] = useState({ excel: false, pdf: false });
  const token = localStorage.getItem("token");

  // Fetch data function with better error handling
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get("/admin/transactions/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setPayments(res.data);
      toast.success("Transactions loaded successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load transactions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Sort function
  const requestSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      const direction = prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
  }, []);

  // Memoized sorted and filtered data
  const filteredPayments = useMemo(() => {
    let results = [...payments];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(payment => 
        payment.student_name.toLowerCase().includes(lowerSearchTerm) ||
        payment.student_email.toLowerCase().includes(lowerSearchTerm) ||
        payment.hostel_name.toLowerCase().includes(lowerSearchTerm) ||
        payment.transaction_id.toLowerCase().includes(lowerSearchTerm) ||
        payment.status.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      // Handle numeric fields specially
      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc" 
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      }
      
      // Handle date fields specially
      if (sortConfig.key === "created_at") {
        return sortConfig.direction === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      
      // Default string comparison
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    
    return results;
  }, [payments, searchTerm, sortConfig]);

  // Export functions with loading states
  const exportToExcel = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, excel: true }));
    
    try {
      const data = filteredPayments.map(payment => ({
        Name: payment.student_name,
        Email: payment.student_email,
        Hostel: payment.hostel_name,
        Amount: `Rs. ${Number(payment.amount).toFixed(2)}`,
        Transaction_ID: payment.transaction_id,
        Status: payment.status,
        Method: payment.payment_method,
        Date: new Date(payment.created_at).toLocaleString()
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
      // Add some styling to headers
      const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EFEFEF" } }
      };
      
      // Apply header styling
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
        worksheet[cellRef].s = headerStyle;
      }
    
      XLSX.writeFile(workbook, 'Transactions_Report.xlsx');
      toast.success("Excel file exported successfully");
    } catch (error) {
      toast.error("Failed to export Excel file");
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  }, [filteredPayments]);
  
  const exportToPDF = useCallback(async () => {
    setExportLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      const doc = new jsPDF();
    
      // Add title
      doc.setFontSize(16);
      doc.text("Transactions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
      const tableColumn = [
        "Name", "Email", "Hostel", "Amount", "Txn ID", "Status", "Method", "Date"
      ];
      
      const tableRows = filteredPayments.map(payment => [
        payment.student_name,
        payment.student_email,
        payment.hostel_name,
        `Rs. ${Number(payment.amount).toFixed(2)}`,
        payment.transaction_id,
        payment.status,
        payment.payment_method,
        new Date(payment.created_at).toLocaleString()
      ]);
    
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [73, 80, 87] }
      });
    
      // Add summary
      const finalY = doc.lastAutoTable.finalY;
      doc.text(`Total Transactions: ${filteredPayments.length}`, 14, finalY + 10);
      
      if (filteredPayments.length > 0) {
        const totalAmount = filteredPayments
          .reduce((sum, payment) => sum + Number(payment.amount), 0)
          .toFixed(2);
        doc.text(`Total Amount: Rs. ${totalAmount}`, 14, finalY + 18);
      }
    
      doc.save("Transactions_Report.pdf");
      toast.success("PDF file exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF file");
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  }, [filteredPayments]);

  return (
    <div className="admin-transactions-container">
      <AdminSidebar />
      <main className="admin-transactions-content" role="main">
        <div className="admin-transactions-inner">
          <header className="transactions-header">
            <div className="header-title-section">
              <h1>Transactions</h1>
              {!loading && filteredPayments.length > 0 && (
                <span className="results-count">
                  Showing {filteredPayments.length} of {payments.length} transactions
                </span>
              )}
            </div>
            
            <div className="actions-container">
              <div className="search-container" role="search">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, email, hostel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search transactions"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search" 
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button 
                  onClick={fetchPayments} 
                  className="refresh-button"
                  disabled={loading}
                  aria-label="Refresh transactions"
                >
                  <FaSync className={loading ? "spin" : ""} /> Refresh
                </button>
              </div>
              
              <div className="export-buttons">
                <button 
                  onClick={exportToExcel}
                  disabled={loading || exportLoading.excel || filteredPayments.length === 0}
                  className="export-button excel"
                  aria-label="Export to Excel"
                >
                  <FaFileExcel /> Excel
                </button>
                <button 
                  onClick={exportToPDF}
                  disabled={loading || exportLoading.pdf || filteredPayments.length === 0}
                  className="export-button pdf"
                  aria-label="Export to PDF"
                >
                  <FaFilePdf /> PDF
                </button>
              </div>
            </div>
          </header>

          {error ? (
            <div className="error-state" aria-live="assertive">
              <p>{error}</p>
              <button onClick={fetchPayments} className="retry-button">Retry</button>
            </div>
          ) : (
            <>
              <TransactionTable 
                transactions={filteredPayments}
                sortConfig={sortConfig}
                requestSort={requestSort}
                isLoading={loading}
              />
              
              <TransactionSummary transactions={filteredPayments} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTransactions;