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
      showNotification("PDF downloaded!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to download PDF", "error");
    }
  };

  // --- Filtering ---
  const filteredRecords = emailRecords.filter((record) => {
    const searchMatch =
      record.from_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.to_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase());

    const dateMatch = dateFilter
      ? new Date(record.sent_date).toISOString().split("T")[0] === dateFilter
      : true;

    return searchMatch && dateMatch;
  });

  if (loading)
    return (
      <div className="page active">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading email records...</p>
        </div>
      </div>
    );

  return (
    <div className="page active">
      {/* Compose Email */}
      <ComposeEmail onRecordSaved={(newRecord) => setEmailRecords((prev) => [newRecord, ...prev])} />

      {/* Header */}
      <div className="records-header">
        <h2>Email Records</h2>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filters">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* Records Table */}
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Subject</th>
                <th>Date</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    No email records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.from_user}</td>
                    <td>{record.to_user}</td>
                    <td>{record.subject}</td>
                    <td>{new Date(record.sent_date).toLocaleDateString()}</td>
                    <td>{record.pdf_filename ? "✅" : "❌"}</td>
                    <td>
                      <button onClick={() => setSelectedEmail(record)}>View</button>
                      {record.pdf_filename?.split(",").map((fn) => (
                        <button key={fn} onClick={() => downloadPdf(fn.trim())}>
                          PDF
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedEmail && (
        <div ref={modalRef}>
          <Modal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
        </div>
      )}

      {/* Styles */}
      <style>{`
        .card { padding: 1rem; border-radius: 12px; background: #fff; box-shadow: 0 8px 20px rgba(2,6,23,0.06); max-width: 1100px; margin: 1.25rem auto; }
        .records-header { display:flex; justify-content:space-between; align-items:center; max-width:1100px; margin: 1rem auto 0; padding: 0 1rem; }
        .records-header h2 { margin:0; }
        .filters { display:flex; gap:0.75rem; margin-bottom: 1rem; flex-wrap:wrap; }
        .filters input[type=text], .filters input[type=date] { padding:0.5rem 0.75rem; border-radius:8px; border:1px solid #e6eef8; }
        .table-container { overflow-x:auto; }
        .records-table { width:100%; border-collapse: collapse; min-width:700px; }
        .records-table th, .records-table td { text-align:left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #f1f5f9; }
        .records-table th { background: #fbfdff; font-weight:700; }
        .records-table button { margin-right: 6px; padding:6px 8px; border-radius:6px; border:none; background:#2563eb; color:#fff; cursor:pointer; }
        .records-table button:disabled { opacity:0.6; cursor:not-allowed; }
        @media (max-width:720px) {
          .records-header { padding: 0 0.5rem; }
          .card { margin: 0.75rem; padding: 0.85rem; }
          .records-table { min-width: 520px; }
        }
      `}</style>
    </div>
  );
};

export default EmailRecords;
