import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { timeAgo } from "../../utils/timeAgo";

interface Props {
<<<<<<< HEAD
  postId: string;
=======
  postSlug: string;
>>>>>>> master
  title?: string;
  emptyMessage?: string;
  placeholder?: string;
}

<<<<<<< HEAD
export function CommentsSection({ postId, title, emptyMessage, placeholder }: Props) {
=======
export function CommentsSection({ postSlug, title, emptyMessage, placeholder }: Props) {
>>>>>>> master
  const {
    comments,
    customerSession,
    addComment,
    editComment,
    deleteComment
  } = useAppContext();
<<<<<<< HEAD
  const list = comments[postId] || [];
=======
  const list = comments[postSlug] || [];
>>>>>>> master
  const sectionTitle = title || "Comentarios";
  const emptyLabel = emptyMessage || "Aún no hay comentarios. ¡Sé el primero!";
  const inputPlaceholder = placeholder || "¿Qué te pareció este artículo?";

  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

<<<<<<< HEAD
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
=======
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
>>>>>>> master
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      setError("Escribe algo.");
      return;
    }
<<<<<<< HEAD
    const result = addComment(postId, text);
=======
    const result = await addComment(postSlug, text);
>>>>>>> master
    if (!result.ok) {
      setError(result.message || "No pudimos publicar tu comentario.");
      return;
    }
    setDraft("");
    setError("");
  };

  const beginEdit = (id: string, current: string) => {
    setEditingId(id);
    setEditDraft(current);
  };

  const saveEdit = (id: string) => {
    const text = editDraft.trim();
    if (!text) return;
<<<<<<< HEAD
    editComment(postId, id, text);
=======
    editComment(postSlug, id, text);
>>>>>>> master
    setEditingId(null);
    setEditDraft("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
  };

  const myEmail = customerSession?.email.toLowerCase() || "";

  return (
    <section className="comments">
      <h2 className="section-title">{sectionTitle}</h2>
      <div className="comments__list">
        {list.length === 0 && <p className="muted">{emptyLabel}</p>}
        {list.map((comment) => {
          const mine = myEmail && comment.ownerId === myEmail;
          return (
            <div className="comment" key={comment.id}>
              <div className="comment__head">
                <strong>{comment.authorName || comment.authorEmail.split("@")[0]}</strong>
                <span className="muted small">· {timeAgo(comment.ts)}</span>
                {comment.editedAt && <span className="muted small"> · editado</span>}
              </div>
              {editingId === comment.id ? (
                <textarea
                  className="input comment__edit"
                  rows={3}
                  maxLength={300}
                  value={editDraft}
                  onChange={(event) => setEditDraft(event.target.value)}
                />
              ) : (
                <p className="comment__text">{comment.text}</p>
              )}
              {mine && (
                <div className="comment__actions">
                  {editingId === comment.id ? (
                    <>
                      <button
                        className="btn btn--primary btn-sm"
                        type="button"
                        onClick={() => saveEdit(comment.id)}
                      >
                        Guardar
                      </button>
                      <button
                        className="btn btn--ghost btn-sm"
                        type="button"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn--ghost btn-sm"
                        type="button"
                        onClick={() => beginEdit(comment.id, comment.text)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--ghost btn-sm"
                        type="button"
<<<<<<< HEAD
                        onClick={() => deleteComment(postId, comment.id)}
=======
                        onClick={() => deleteComment(postSlug, comment.id)}
>>>>>>> master
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="comments__formwrap" style={{ marginTop: "12px" }}>
        {customerSession ? (
          <form id="commentForm" className="comment__form" onSubmit={handleSubmit} noValidate>
            <label className="muted small" htmlFor="commentText">
              Escribe un comentario (máx 300):
            </label>
            <textarea
              id="commentText"
              className="input"
              rows={3}
              maxLength={300}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={inputPlaceholder}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
              <button className="btn btn--primary" type="submit">
                Publicar
              </button>
              <small className="muted">
                Comentando como <strong>{customerSession.nombre?.split(" ")[0] || customerSession.email}</strong>
              </small>
            </div>
            <small className="help">{error}</small>
          </form>
        ) : (
          <div className="muted">
            Debes <Link className="link" to="/login">iniciar sesión</Link> para comentar.
          </div>
        )}
      </div>
    </section>
  );
}
