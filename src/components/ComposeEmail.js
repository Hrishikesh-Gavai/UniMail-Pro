import React, { useState, useRef } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";

const ComposeEmail = ({ onRecordSaved }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL; // ✅ Vite env
  const [formData, setFormData] = useState({
    from: "",
    to: [],
    subject: "",
    content: "",
    pdfFiles: [],
    pdfFileNames: [],
    subjectHindi: "",
    contentHindi: "",
    sentDate: new Date().toISOString().split("T")[0],
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const emailOptions = {
    Principal: ["Principal-1@kkwagh.edu.in"],
    HOD: [
      "dkpatil370123@kkwagh.edu.in",
      "dapagar370123@kkwagh.edu.in",
      "dhruveshpatil7777@gmail.com",
      "nakshatrarao48@gmail.com",
      "pmlokwani370123@kkwagh.edu.in",
      "hagavai370123@kkwagh.edu.in",
      "ranjit.pawar5142@gmail.com",
    ],
    Dean: [
      "Dean-1@kkwagh.edu.in",
      "Dean-2@kkwagh.edu.in",
      "Dean-3@kkwagh.edu.in",
      "Dean-4@kkwagh.edu.in",
      "Dean-5@kkwagh.edu.in",
      "Dean-6@kkwagh.edu.in",
      "Dean-7@kkwagh.edu.in",
    ],
  };

  // --- Input handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualEmailInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newEmail = e.target.value.trim().replace(",", "");
      if (newEmail && !formData.to.includes(newEmail)) {
        setFormData((prev) => ({ ...prev, to: [...prev.to, newEmail] }));
      }
      e.target.value = "";
    }
  };

  const addEmail = (email) => {
    if (!formData.to.includes(email)) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, email] }));
    }
  };

  const removeEmail = (email) => {
    setFormData((prev) => ({
      ...prev,
      to: prev.to.filter((e) => e !== email),
    }));
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setActiveFolder(null);
  };

  // --- PDF Upload ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (let file of files) {
      try {
        if (file.size > 40 * 1024 * 1024) {
          showNotification(`${file.name}: exceeds 40MB`, "error");
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("pdfs").upload(fileName, file);
        if (error) throw error;

        setFormData((prev) => ({
          ...prev,
          pdfFiles: [...prev.pdfFiles, file],
          pdfFileNames: [...prev.pdfFileNames, fileName],
        }));

        showNotification(`Uploaded: ${file.name}`, "success");
      } catch (err) {
        console.error("PDF upload error:", err);
        showNotification(`Failed to upload: ${file.name}`, "error");
      }
    }
  };

  // --- Translation to Hindi ---
  const translateToHindi = async () => {
    if (!formData.subject && !formData.content) {
      showNotification("Enter subject or content to translate", "warning");
      return;
    }
    setTranslating(true);
    const combined = `${formData.subject}\n\n${formData.content}`.trim();

    try {
      const resp = await fetch(`${backendUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combined, target: "hi" }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const parts = (data.translatedText || "").split("\n\n");
        setFormData((prev) => ({
          ...prev,
          subjectHindi: parts[0] || "",
          contentHindi: parts.slice(1).join("\n\n") || "",
        }));
        showNotification("Translated to Hindi successfully!", "success");
        setTranslating(false);
        return;
      }
    } catch (err) {
      console.warn("Translation failed, falling back:", err);
    }

    // fallback
    setFormData((prev) => ({
      ...prev,
      subjectHindi: simpleTransliteration(formData.subject || ""),
      contentHindi: simpleTransliteration(formData.content || ""),
    }));
    showNotification("Used fallback transliteration", "info");
    setTranslating(false);
  };

  const simpleTransliteration = (text) => {
    if (!text) return "";
    const map = { hello: "नमस्ते", email: "ईमेल", message: "संदेश" };
    let out = text;
    Object.entries(map).forEach(([k, v]) => {
      const re = new RegExp(`\\b${k}\\b`, "gi");
      out = out.replace(re, v);
    });
    return out === text ? `हिंदी अनुवाद: ${text}` : out;
  };

  // --- Save record ---
  const saveEmailRecord = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_records")
        .insert([
          {
            from_user: formData.from || "demoxiepaulo@gmail.com",
            to_user: formData.to.join(","),
            subject: formData.subject,
            content: formData.content,
            subject_hindi: formData.subjectHindi,
            content_hindi: formData.contentHindi,
            pdf_filename: formData.pdfFileNames.length
              ? formData.pdfFileNames.join(",")
              : null,
            sent_date: formData.sentDate,
          },
        ])
        .select();

      if (error) throw error;
      const insertedRow = data[0];
      showNotification("Email record saved!", "success");
      if (onRecordSaved) onRecordSaved(insertedRow);
    } catch (err) {
      console.error("Error saving email record:", err);
      showNotification("Failed to save email record", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Open Gmail & Save ---
  const openGmailAndSave = async () => {
    const to = encodeURIComponent(formData.to.join(","));
    const subject = encodeURIComponent(formData.subject || "");
    const bodyText =
      (formData.content || "") +
      (formData.pdfFiles.length
        ? `\n\n[Attach PDFs manually: ${formData.pdfFiles.map((f) => f.name).join(", ")}]`
        : "");
    const body = encodeURIComponent(bodyText);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}&authuser=${encodeURIComponent(
      formData.from || "demoxiepaulo@gmail.com"
    )}`;
    window.open(gmailUrl, "_blank");
    await saveEmailRecord();
  };

  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      <div className="card">
        {/* From */}
        <div className="form-group">
          <label>From</label>
          <input
            type="email"
            name="from"
            value={formData.from}
            onChange={handleInputChange}
            placeholder="Sender email"
          />
        </div>

        {/* To */}
        <div className="form-group">
          <label>To</label>
          <div className="email-input-container">
            <div className="selected-emails">
              {formData.to.map((email) => (
                <span key={email} className="email-chip">
                  {email}
                  <button type="button" onClick={() => removeEmail(email)}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="email-input"
                placeholder="Type or select recipient..."
                onKeyDown={handleManualEmailInput}
              />
              <button type="button" className="dropdown-btn" onClick={toggleDropdown}>▾</button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {!activeFolder ? (
                  Object.keys(emailOptions).map((folder) => (
                    <div key={folder} className="dropdown-item folder" onClick={() => setActiveFolder(folder)}>
                      📁 {folder}
                    </div>
                  ))
                ) : (
                  <>
                    {emailOptions[activeFolder].map((email) => (
                      <div key={email} className="dropdown-item" onClick={() => addEmail(email)}>✉ {email}</div>
                    ))}
                    <button className="back-btn" onClick={() => setActiveFolder(null)}>← Back</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label>Subject</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} />
        </div>

        {/* Content */}
        <div className="form-group">
          <label>Content</label>
          <textarea name="content" value={formData.content} onChange={handleInputChange} rows={6} />
        </div>

        {/* Sent Date */}
        <div className="form-group">
          <label>Sent Date</label>
          <input type="date" name="sentDate" value={formData.sentDate} onChange={handleInputChange} />
        </div>

        {/* PDFs */}
        <div className="form-group">
          <label>Upload PDFs</label>
          <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileUpload} />
          {formData.pdfFiles.length > 0 && (
            <ul>{formData.pdfFiles.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
          )}
        </div>

        {/* Buttons */}
        <div className="actions">
          <button onClick={translateToHindi} disabled={translating}>
            {translating ? "Translating..." : "Translate to Hindi"}
          </button>
          <button onClick={openGmailAndSave} disabled={loading}>Open in Gmail & Save</button>
          <button onClick={saveEmailRecord} disabled={loading}>Save Only</button>
        </div>

        {/* Hindi */}
        {(formData.subjectHindi || formData.contentHindi) && (
          <div className="translated-box">
            {formData.subjectHindi && <div><strong>Subject (Hindi):</strong> {formData.subjectHindi}</div>}
            {formData.contentHindi && <div><strong>Content (Hindi):</strong><pre>{formData.contentHindi}</pre></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposeEmail;
