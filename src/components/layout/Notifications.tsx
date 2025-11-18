import { useAppContext } from "../../context/AppContext";

export function Notifications() {
  const { notifications, dismissNotification } = useAppContext();

  if (!notifications.length) {
    return null;
  }

  const toasts = notifications.filter((entry) => entry.mode === "toast");
  const dialogs = notifications.filter((entry) => entry.mode === "dialog");

  return (
    <>
      {toasts.length > 0 ? (
        <div className="app-toast-stack" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className={`app-toast app-toast--${toast.kind}`}>
              <span className="app-toast__message">{toast.message}</span>
              <button
                type="button"
                className="app-toast__close"
                onClick={() => dismissNotification(toast.id)}
                aria-label="Cerrar aviso"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {dialogs.map((dialog) => (
        <div key={dialog.id} className="app-dialog-overlay" role="alertdialog" aria-modal="true">
          <div className={`app-dialog app-dialog--${dialog.kind}`}>
            <p className="app-dialog__message">{dialog.message}</p>
            <button
              type="button"
              className="btn btn--primary app-dialog__btn"
              onClick={() => {
                dismissNotification(dialog.id);
                dialog.onAction?.();
              }}
            >
              {dialog.actionLabel || "Aceptar"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
