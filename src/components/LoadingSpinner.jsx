import './LoadingSpinner.css';

export default function LoadingSpinner({ fullPage = false }) {
  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loading-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="loading-text">Загрузка...</p>
    </div>
  );
}