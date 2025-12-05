import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  labels: string[];
  data: number[];
  colors: string[];
}

const TopicsChart = ({ labels, data, colors }: Props) => (
  <div className="chart-card">
    <div className="card-header">
      <h3>Topics overview</h3>
      <p>Quick glance at how many prompts each area holds.</p>
    </div>
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Questions',
            data,
            backgroundColor: colors,
            borderRadius: 12
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#555' }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }}
    />
  </div>
);

export default TopicsChart;
