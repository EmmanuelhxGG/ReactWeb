import { useState } from "react";
import { useAppContext, type AppNotification } from "../../context/AppContext";

function DialogNotification({
  dialog,
  dismiss
}: {
  dialog: AppNotification;
  dismiss: (id: string) => void;
}) {
  const [value, setValue] = useState(dialog.input?.defaultValue ?? "");
  const inputId = dialog.input ? `${dialog.id}-input` : undefined;
  const autoFocus = dialog.input?.autoFocus ?? true;

  const handleConfirm = () => {
    dismiss(dialog.id);
    dialog.onAction?.(dialog.input ? value : undefined);
  };

  const handleCancel = () => {
    dismiss(dialog.id);
    dialog.onCancel?.();
  };

  return (
    <div className="app-dialog-overlay" role="alertdialog" aria-modal="true">
      <div className={`app-dialog app-dialog--${dialog.kind}`}>
        <p className="app-dialog__message">{dialog.message}</p>

        {dialog.input ? (
          <label className="app-dialog__field" htmlFor={inputId}>
            {dialog.input.label ? <span>{dialog.input.label}</span> : null}
            <input
              id={inputId}
              className="app-dialog__input"
              type={dialog.input.type ?? "text"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={dialog.input.placeholder}
              maxLength={dialog.input.maxLength}
              min={dialog.input.min}
              max={dialog.input.max}
              step={dialog.input.step}
              autoFocus={autoFocus}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleConfirm();
                }
              }}
              inputMode={dialog.input.type === "number" ? "numeric" : undefined}
            />
          </label>
        ) : null}

        <div className="app-dialog__actions">
          {dialog.cancelLabel ? (
            <button type="button" className="btn btn--ghost app-dialog__btn" onClick={handleCancel}>
              {dialog.cancelLabel}
            </button>
          ) : null}
          <button type="button" className="btn btn--primary app-dialog__btn" onClick={handleConfirm}>
            {dialog.actionLabel || "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <DialogNotification key={dialog.id} dialog={dialog} dismiss={dismissNotification} />
      ))}
    </>
  );
}
