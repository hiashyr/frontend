import './LoadingSpinner.css';

export default function LoadingSpinner({ fullPage = false, text = "Загрузка..." }) {
  return (
    <div className={`loading-spinner-container ${fullPage ? 'full-page' : ''}`}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}