import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TheoryPage.css'; // Создай этот файл для своих стилей

const TheoryPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const results = [];
    topics.forEach((topic) => {
      if (topic.text.toLowerCase().includes(query)) {
        results.push({ type: 'topic', id: topic.id, text: topic.text });
      }
      topic.points?.forEach((point) => {
        if (point.text.toLowerCase().includes(query)) {
          results.push({ type: 'point', id: point.id, text: point.text, topicId: topic.id });
        }
        point.rules?.forEach((rule) => {
          if (rule.text.toLowerCase().includes(query)) {
            results.push({ type: 'rule', id: rule.id, text: rule.text, pointId: point.id, topicId: topic.id });
          }
        });
      });
    });

    setSearchResults(results);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="page-container">
      <Header />
      <main className="theory-main">
        <div className="theory-container">
          <h1 className="theory-title">Теория ПДД 2024</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Результаты поиска:</h3>
                <ul>
                  {searchResults.map((result, index) => (
                    <li key={index}>
                      {result.type === 'topic' && (
                        <a href={`#topic-${result.id}`} onClick={(e) => { e.preventDefault(); handleScrollToSection(`topic-${result.id}`); }}>
                          {result.text}
                        </a>
                      )}
                      {result.type === 'point' && (
                        <a href={`#point-${result.id}`} onClick={(e) => { e.preventDefault(); handleScrollToSection(`point-${result.id}`); }}>
                          {result.text}
                        </a>
                      )}
                      {result.type === 'rule' && (
                        <a href={`#rule-${result.id}`} onClick={(e) => { e.preventDefault(); handleScrollToSection(`rule-${result.id}`); }}>
                          {result.text}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
                    <div className="topics-list">
            {topics.map((topic) => (
              <div key={topic.id} id={`topic-${topic.id}`} className="topic-section">
                <h2 onClick={() => toggleSection(`topic-${topic.id}`)} style={{ cursor: 'pointer' }}>
                  {topic.text} {expandedSections[`topic-${topic.id}`] ? '-' : '+'}
                </h2> {/* Используем text, а не name */}

                {expandedSections[`topic-${topic.id}`] && (
                  <div className="points-list">
                    {topic.points?.map((point) => (
                      <div key={point.id} className="point-section">
                        <h3 onClick={() => toggleSection(`point-${point.id}`)} style={{ cursor: 'pointer' }}>
                          {point.text} {expandedSections[`point-${point.id}`] ? '-' : '+'}
                        </h3> {/* Используем text, а не name */}

                        {expandedSections[`point-${point.id}`] && (
                          <div className="rules-list">
                            {point.rules?.map((rule) => (
                              <div key={rule.id} className="rule-item">
                                <p>{rule.text}</p> {/* Используем text, а не name */}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TheoryPage;
