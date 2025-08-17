import { Chart as ChartJS, registerables } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './TestStatsCharts.css';

ChartJS.register(...registerables, ChartDataLabels);

export default function TestStatsCharts({ stats }) {
  if (!stats) {
    return null;
  }

  // Data for the pie chart (successful vs failed tests)
  const pieChartData = {
    labels: ['Успешные', 'Неуспешные'],
    datasets: [{
      data: [stats.statusCounts.passed, stats.statusCounts.failed],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderWidth: 1
    }]
  };

  // Data for the bar chart (tests by type)
  const barChartData = {
    labels: ['Экзамен', 'Тема', 'Сложный'],
    datasets: [{
      label: 'Количество тестов',
      data: [stats.typeCounts.exam, stats.typeCounts.topic, stats.typeCounts.hard],
      backgroundColor: ['#2196F3', '#FF9800', '#9C27B0'],
      borderWidth: 1
    }]
  };

  // Find the most popular topic (based on session count)
  const mostPopularTopic = stats.topicCounts.length > 0 ? stats.topicCounts[0] : { name: 'Нет данных', sessionCount: 0, questionsCount: 0 };

  // Common chart options
  const commonOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Roboto, sans-serif'
          }
        }
      }
    }
  };

  return (
    <div className="test-stats-charts">
      <div className="chart-container">
        <h3>Успешные vs. Неуспешные тесты</h3>
        <div className="chart-inner">
          <Pie
            data={pieChartData}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                datalabels: {
                  formatter: (value) => `${value}`,
                  color: '#fff',
                  font: {
                    weight: 'bold'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="chart-container">
        <h3>Тесты по режиму</h3>
        <div className="chart-inner">
          <Bar
            data={barChartData}
            options={{
              ...commonOptions,
              indexAxis: 'y',
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                ...commonOptions.plugins,
                datalabels: {
                  anchor: 'end',
                  align: 'right',
                  formatter: (value) => value,
                  font: {
                    weight: 'bold'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="chart-container">
        <h3>Статистика по темам</h3>
        <div className="chart-inner">
          <div className="stats-box">
            <p className="stats-label">Процент правильных ответов:</p>
            <p className="stats-value">{stats.averageCorrectRate}%</p>
            <h3>Самая популярная тема:</h3>
            <p className="stats-value">{mostPopularTopic.name}</p>
            <p className="stats-label">Количество сессий:</p>
            <p className="stats-value">{mostPopularTopic.sessionCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
