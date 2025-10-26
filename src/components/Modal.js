import React from 'react';

const Modal = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Email Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div>
            <h3>From</h3>
            <p>{email.from_user}</p>
            
            <h3>To</h3>
            <p>{email.to_user}</p>
            
            <h3>Date</h3>
            <p>{new Date(email.sent_date).toLocaleDateString()}</p>
            
            <h3>Subject</h3>
            <p>{email.subject}</p>
          </div>
          
          <div>
            {email.subject_hindi && (
              <>
                <h3>Subject (Hindi)</h3>
                <p>{email.subject_hindi}</p>
              </>
            )}
            
            <h3>Content</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              {email.content.split('\n').map((line, i) => (
                <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                  {line || <br />}
                </p>
              ))}
            </div>
            
            {email.content_hindi && (
              <>
                <h3>Content (Hindi)</h3>
                <div>
                  {email.content_hindi.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
