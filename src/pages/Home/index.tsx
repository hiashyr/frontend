import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

const Home = () => {
  return (
        <div className="home-page">
        <h1>Добро пожаловать в систему тестирования ПДД</h1>
        
        <div className="navigation">
            <Link to="/tests" className="nav-button">
            Пройти тест
            </Link>
            <Link to="/rules" className="nav-button">
            Правила ПДД
            </Link>
            {localStorage.getItem('token') ? (
            <Link to="/profile" className="nav-button">
                Личный кабинет
            </Link>
            ) : (
            <Link to="/login" className="nav-button">
                Войти
            </Link>
            )}
        </div>

        <div className="features">
            <h2>Возможности системы:</h2>
            <ul>
            <li>Тестирование по официальным билетам ПДД</li>
            <li>Разбор ошибок после прохождения</li>
            <li>Статистика результатов</li>
            <li>Актуальные правила дорожного движения</li>
            </ul>
        </div>
        </div>
  );
};

export default Home;