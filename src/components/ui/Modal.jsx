export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        <header>
          <a href="#close"
             aria-label="Close"
             className="close"
             onClick={(e) => {
               e.preventDefault();
               onClose();
             }}>
          </a>
          <h3>{title}</h3>
        </header>
        <div>
          {children}
        </div>
      </article>
    </dialog>
  );
}