import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const TheoryPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTheoryData = async () => {
      try {
        const topicsData = await api.get('/theory-topics');
        console.log('Topics data:', topicsData);
        setTopics(topicsData);
      } catch (err) {
        setError('Ошибка при загрузке данных теории');
        console.error('Ошибка при загрузке данных теории:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheoryData();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="theory-container">
      <h1>Теория ПДД</h1>

      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-section">
            <h2>{topic.text}</h2> {/* Используем text, а не name */}

            <div className="points-list">
              {topic.points?.map((point) => (
                <div key={point.id} className="point-section">
                  <h3>{point.text}</h3> {/* Используем text, а не name */}

                  <div className="rules-list">
                    {point.rules?.map((rule) => (
                      <div key={rule.id} className="rule-item">
                        <p>{rule.text}</p> {/* Используем text, а не name */}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheoryPage;
