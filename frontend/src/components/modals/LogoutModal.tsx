import React from "react";
import "./LogoutModal.css";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const LogoutModal = ({ isOpen, onClose, onConfirm }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-logout-container">
        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-text">Are you sure you want to log out?</p>
        <div className="modal-actions">
          <button
            className="btn btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-logout"
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
