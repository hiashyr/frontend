import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './admin.css';

const QuestionsPage = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const navigate = useNavigate();

  const fetchQuestions = async (page = 1) => {
    try {
      const { data } = await API.get('/admin/questions', {
        params: { page, limit: 20 }
      });
      setQuestions(data.questions);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setFilteredQuestions(data.questions); // Initialize filtered questions
    } catch (err) {
      console.error('Ошибка загрузки вопросов:', err);
      setError('Не удалось загрузить вопросы');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    if (user && user.role === 'admin') {
      fetchQuestions();
    }
  }, [user, navigate]);

  const handlePageChange = (page) => {
    setIsLoading(true);
    setCurrentPage(page);
    fetchQuestions(page);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term) {
      const results = questions.filter(question =>
        question.id.toString().includes(term) ||
        question.text.toLowerCase().includes(term) ||
        question.topic.name.toLowerCase().includes(term) ||
        question.answers.some(answer =>
          answer.text.toLowerCase().includes(term) &&
          answer.isCorrect
        )
      );
      setFilteredQuestions(results);
    } else {
      setFilteredQuestions(questions);
    }
  };

  if (!user || user.role !== 'admin') {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <button onClick={() => window.location.reload()}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <div className="questions-page">
          <button
            className="profile-close-btn"
            onClick={() => navigate('/')}
            aria-label="Закрыть страницу настроек"
          >
            <FaTimes aria-hidden="true" />
          </button>
          <h1>Управление вопросами</h1>
          <input
            type="text"
            placeholder="Поиск по вопросам..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {isLoading ? (
            <div className="loading">Загрузка данных...</div>
          ) : (
            <div className="questions-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название вопроса</th>
                    <th>Тема вопроса</th>
                    <th>Правильный ответ</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? filteredQuestions : questions).map(question => (
                    <tr key={question.id}>
                      <td>{question.id}</td>
                      <td>{question.text}</td>
                      <td>{question.topic.name}</td>
                      <td>
                        {question.answers
                          .filter(answer => answer.isCorrect)
                          .map(answer => answer.text)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={page === currentPage}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
