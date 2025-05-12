import { Chart as ChartJS, registerables } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './TestCharts.css';

ChartJS.register(...registerables, ChartDataLabels);

export default function TestCharts({ stats }) {
  if (!stats || stats.overall.totalTests === 0) {
    return null;
  }

  // Рассчитываем процент успешных экзаменов
  const calculateExamSuccessRate = () => {
    if (!stats?.examStats?.recent?.length) return 0;
    const passedExams = stats.examStats.recent.filter(a => a.status === 'passed').length;
    return Math.round((passedExams / stats.examStats.recent.length) * 100);
  };

  const examSuccessRate = calculateExamSuccessRate();

  // Данные для графиков
  const pieChartData = {
    labels: ['Правильные ответы', 'Ошибки'],
    datasets: [{
      data: [stats?.overall?.averageScore || 0, 100 - (stats?.overall?.averageScore || 0)],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderWidth: 1
    }]
  };

  const lineChartData = {
    labels: stats?.recent?.map((_, i) => i + 1) || [],
    datasets: [{
      label: 'Процент правильных ответов',
      data: stats?.recent?.map(a => Math.round((a.correctAnswers / a.totalQuestions) * 100)) || [],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };

  const barChartData = {
    labels: ['Средний балл', 'Процент сдачи'],
    datasets: [{
      label: 'Экзамены',
      data: [stats?.examStats?.averageScore || 0, examSuccessRate],
      backgroundColor: ['#FF9800', '#9C27B0'],
      borderWidth: 1
    }]
  };

  // Общие настройки для всех графиков
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
    <div className="charts-grid">
      {/* Первая диаграмма - круговая */}
      <div className="chart-container">
        <h3>Общая статистика</h3>
        <div className="chart-inner">
          <Pie 
            data={pieChartData} 
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                datalabels: {
                  formatter: (value) => `${value}%`,
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

      {/* Вторая диаграмма - линейная */}
      <div className="chart-container">
        <h3>Прогресс</h3>
        <div className="chart-inner">
          <Line 
            data={lineChartData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Третья диаграмма - столбчатая */}
      <div className="chart-container">
        <h3>Результаты экзаменов</h3>
        <div className="chart-inner">
          <Bar 
            data={barChartData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              plugins: {
                ...commonOptions.plugins,
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => `${value}%`,
                  font: {
                    weight: 'bold'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}