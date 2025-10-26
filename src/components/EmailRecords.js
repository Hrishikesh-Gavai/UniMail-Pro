import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";
import Modal from "./Modal";
import ComposeEmail from "./ComposeEmail";

const EmailRecords = () => {
  const [emailRecords, setEmailRecords] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const modalRef = useRef(null);

  useEffect(() => {
    loadEmailRecords();
  }, []);

  useEffect(() => {
    if (selectedEmail && modalRef.current) {
      setTimeout(() => {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedEmail]);

  // --- Load email records from Supabase ---
  const loadEmailRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_records")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEmailRecords(data || []);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load email records", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Download PDF from Supabase storage ---
  const downloadPdf = async (filename) => {
    setDownloading(prev => ({ ...prev, [filename]: true }));
    try {
      const { data, error } = await supabase.storage.from("pdfs").download(filename);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("PDF downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to download PDF", "error");
    } finally {
      setDownloading(prev => ({ ...prev, [filename]: false }));
    }
  };

  // --- Filtering ---
  const filteredRecords = emailRecords.filter((record) => {
    const searchMatch =
      record.from_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.to_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const dateMatch = dateFilter
      ? new Date(record.sent_date).toISOString().split("T")[0] === dateFilter
      : true;

    return searchMatch && dateMatch;
  });

  if (loading) {
    return (
      <div className="page active">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading email records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Compose Email Section */}
      <ComposeEmail onRecordSaved={(newRecord) => setEmailRecords((prev) => [newRecord, ...prev])} />

      {/* Email Records Section */}
      <div className="card">
        <div className="records-header">
          <h2 className="page-title">Email Records</h2>
          <div className="records-stats">
            <span className="stat-badge">
              Total: {emailRecords.length}
            </span>
            <span className="stat-badge">
              Filtered: {filteredRecords.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search emails by sender, recipient, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          />
          <button 
            onClick={loadEmailRecords}
            className="refresh-btn"
            title="Refresh records"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        {/* Records Table */}
        <div className="table-container">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No email records found</h3>
              <p>
                {searchTerm || dateFilter 
                  ? "Try adjusting your search or filter criteria" 
                  : "No emails have been composed yet. Start by composing your first email above."
                }
              </p>
            </div>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Attachments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="email-cell">
                      <div className="email-address">
                        <i className="fas fa-user"></i>
                        {record.from_user}
                      </div>
                    </td>
                    <td className="email-cell">
                      <div className="recipients">
                        {record.to_user?.split(',').map((email, idx) => (
                          <span key={idx} className="recipient-email">
                            {email}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="subject-cell">
                      <div className="subject-text" title={record.subject}>
                        {record.subject || "No subject"}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(record.sent_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="attachment-cell">
                      {record.pdf_filename ? (
                        <span className="attachment-badge">
                          <i className="fas fa-paperclip"></i>
                          {record.pdf_filename.split(',').length} file(s)
                        </span>
                      ) : (
                        <span className="no-attachment">—</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => setSelectedEmail(record)}
                          className="btn-view"
                          title="View details"
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                        {record.pdf_filename && record.pdf_filename.split(',').map((filename) => (
                          <button 
                            key={filename}
                            onClick={() => downloadPdf(filename.trim())}
                            disabled={downloading[filename]}
                            className="btn-download"
                            title="Download PDF"
                          >
                            <i className="fas fa-download"></i>
                            {downloading[filename] ? "..." : "PDF"}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination/Info */}
        {filteredRecords.length > 0 && (
          <div className="table-footer">
            <div className="records-info">
              Showing {filteredRecords.length} of {emailRecords.length} records
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedEmail && (
        <div ref={modalRef}>
          <Modal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
        </div>
      )}
    </div>
  );
};

export default EmailRecords;
