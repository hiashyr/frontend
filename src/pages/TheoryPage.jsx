import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './TheoryPage.css';

const TheoryPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Сбрасываем результаты поиска при изменении запроса
    if (isSearchPerformed) {
      setIsSearchPerformed(false);
      setSearchResults([]);
    }
  };

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchPerformed(false);
      return;
    }

    const query = searchQuery.toLowerCase();
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
    setIsSearchPerformed(true);

    // Автоматически раскрываем все секции при поиске
    const newExpandedSections = {};
    results.forEach(result => {
      if (result.type === 'topic') {
        newExpandedSections[`topic-${result.id}`] = true;
      } else if (result.type === 'point') {
        newExpandedSections[`topic-${result.topicId}`] = true;
        newExpandedSections[`point-${result.id}`] = true;
      } else if (result.type === 'rule') {
        newExpandedSections[`topic-${result.topicId}`] = true;
        newExpandedSections[`point-${result.pointId}`] = true;
      }
    });
    setExpandedSections(newExpandedSections);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchPerformed(false);
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

  // Функция для определения, нужно ли показывать элемент при поиске
  const shouldShowElement = (element, elementType, id, parentIds = {}) => {
    if (!isSearchPerformed) return true;

    return searchResults.some(result => {
      if (result.type === elementType && result.id === id) return true;
      if (elementType === 'point' && result.type === 'rule' && result.pointId === id) return true;
      if (elementType === 'topic' && (
        (result.type === 'point' && result.topicId === id) ||
        (result.type === 'rule' && result.topicId === id)
      )) return true;
      return false;
    });
  };

  return (
    <div className="page-container">
      <Header />
      <main className="theory-main">
        <div className="theory-container">
          <h1 className="theory-title">Теория ПДД 2024</h1>

          <div className="search-container">
            <label htmlFor="search-input" className="search-label">Поиск:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
            <button onClick={performSearch} className="search-button">
              Найти
            </button>
            {isSearchPerformed && (
              <button onClick={clearSearch} className="clear-search-button">
                Очистить
              </button>
            )}
          </div>

          {isSearchPerformed && searchResults.length === 0 && (
            <div className="no-results">
              <p>Ничего не найдено по запросу "{searchQuery}"</p>
            </div>
          )}

          <div className="topics-list">
            {topics.map((topic) => (
              shouldShowElement(topic, 'topic', topic.id) && (
                <div key={topic.id} id={`topic-${topic.id}`} className="topic-section">
                  <h2 onClick={() => toggleSection(`topic-${topic.id}`)} style={{ cursor: 'pointer' }}>
                    {topic.text} {expandedSections[`topic-${topic.id}`] ? '-' : '+'}
                  </h2>
                  {expandedSections[`topic-${topic.id}`] && (
                    <div className="points-list">
                      {topic.points?.map((point) => (
                        shouldShowElement(point, 'point', point.id, { topicId: topic.id }) && (
                          <div key={point.id} id={`point-${point.id}`} className="point-section">
                            <h3 onClick={() => toggleSection(`point-${point.id}`)} style={{ cursor: 'pointer' }}>
                              {point.text} {expandedSections[`point-${point.id}`] ? '-' : '+'}
                            </h3>
                            {expandedSections[`point-${point.id}`] && (
                              <div className="rules-list">
                                {point.rules?.map((rule) => (
                                  shouldShowElement(rule, 'rule', rule.id, { pointId: point.id, topicId: topic.id }) && (
                                    <div key={rule.id} id={`rule-${rule.id}`} className="rule-item">
                                      <p>{rule.text}</p>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TheoryPage;
