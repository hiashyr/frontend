import React from 'react';
import './QuestionCard.css';

const DEFAULT_IMAGE = '/images/default-question-image.jpg';

export default function QuestionCard({ question, answers, onAnswerSelect }) {
  return (
    <div className="question-card">
      <div className="question-content">
        <h3 className="question-text">{question.text}</h3>
        
        {question.imageUrl && (
          <div className="question-image-container">
            <img 
              src={question.imageUrl || DEFAULT_IMAGE} 
              alt="Иллюстрация к вопросу"
              className="question-image"
              onError={(e) => {
                e.target.src = DEFAULT_IMAGE;
              }}
            />
          </div>
        )}
      </div>

      <div className="answers-list">
        {answers.map(answer => (
          <button
            key={answer.id}
            className="answer-button"
            onClick={() => onAnswerSelect(answer.id)}
          >
            {answer.text}
          </button>
        ))}
      </div>
    </div>
  );
}