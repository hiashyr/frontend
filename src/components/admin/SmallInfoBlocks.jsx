import React from 'react';
import './SmallInfoBlocks.css';

export default function SmallInfoBlocks({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="small-info-blocks">
      <div className="info-block">
        <h4>Всего пользователей</h4>
        <p className="info-value">{stats.totalUsers}</p>
      </div>
      <div className="info-block">
        <h4>Зарегистрировано за месяц</h4>
        <p className="info-value">{stats.usersRegisteredLastMonth}</p>
      </div>
      <div className="info-block">
        <h4>Всего вопросов</h4>
        <p className="info-value">{stats.totalQuestionsCount}</p>
      </div>
    </div>
  );
}
