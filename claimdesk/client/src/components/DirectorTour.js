import { useEffect, useState } from 'react';

const STEPS = [
  {
    title: 'Welcome, Director',
    body: 'This quick tour shows you how to review and act on vouchers submitted by employees.',
    target: null,
  },
  {
    title: 'Step 1 - Review the queue',
    body: 'Your dashboard shows how many vouchers are pending. Click "Review pending" or open "All Vouchers" to see the full list with filters.',
    target: 'tour-pending',
  },
  {
    title: 'Step 2 - Open a voucher',
    body: 'Click any row to open the full voucher. You will see employee details, the description, signatures and the amount.',
    target: 'tour-list',
  },
  {
    title: 'Step 3 - Use the AI risk panel',
    body: 'On a submitted voucher, the AI panel scores risk based on amount, description quality, employee history and the date. Use it as a sanity check - you stay in control of the final decision.',
    target: 'tour-ai',
  },
  {
    title: 'Step 4 - Approve or reject',
    body: 'Upload your signature and click "Approve" to clear the voucher, or open the reject panel to send it back with a reason. That is the whole loop.',
    target: 'tour-act',
  },
];

export default function DirectorTour({ open, onClose }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  if (!open) return null;
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;
  const isFirst = idx === 0;

  return (
    <div className="cd-tour-backdrop">
      <div className="cd-tour-card">
        <div className="cd-tour-head">
          <span className="cd-tour-step">Step {idx + 1} of {STEPS.length}</span>
          <button className="cd-tour-x" onClick={onClose} aria-label="Close tour">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <h5 className="cd-tour-title">{step.title}</h5>
        <p className="cd-tour-body">{step.body}</p>
        <div className="cd-tour-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`cd-tour-dot ${i === idx ? 'active' : ''}`} />
          ))}
        </div>
        <div className="cd-tour-actions">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Skip tour</button>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={isFirst} onClick={() => setIdx((x) => Math.max(0, x - 1))}>
              <i className="bi bi-arrow-left me-1"></i>Back
            </button>
            {!isLast ? (
              <button className="btn btn-primary btn-sm" onClick={() => setIdx((x) => Math.min(STEPS.length - 1, x + 1))}>
                Next<i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onClose}>
                Got it<i className="bi bi-check2 ms-1"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
