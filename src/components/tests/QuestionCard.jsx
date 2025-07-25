import React, { useState } from 'react';
import './QuestionCard.css';

const DEFAULT_IMAGE = '/images/default-question-image.jpg';

const QuestionCard = ({ question, answers, onAnswerSelect, selectedAnswer }) => {
  const [imageError, setImageError] = useState(false);
  const baseUrl = process.env.REACT_APP_API_URL;

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${baseUrl}/api/uploads/questions/${imageUrl}`;
  };

  return (
    <div className="question-card">
      <div className="question-content">
        <h3 className="question-text">{question.text}</h3>
        
        {question.imageUrl && !imageError && (
          <div className="question-image-container">
            <img 
              src={getImageUrl(question.imageUrl)}
              alt="Иллюстрация к вопросу"
              className="question-image"
              onError={(e) => {
                console.error('Failed to load question image:', question.imageUrl);
                setImageError(true);
              }}
            />
          </div>
        )}
      </div>

      <div className="answers-list">
        {answers.map(answer => (
          <div
            key={answer.id}
            className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''}`}
            onClick={() => onAnswerSelect(answer.id)}
          >
            {answer.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;