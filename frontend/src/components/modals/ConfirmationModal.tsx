import "./ConfirmationModal.css"

type ConfirmationModalProps = {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "primary" | "success"
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
  onClose,
  onConfirm
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-confirm-container">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <div className="modal-actions">
          <button
            className="btn btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-confirm btn-${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}