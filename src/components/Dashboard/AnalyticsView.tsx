import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsView = () => {
  const [data, setData] = useState({
    labels: ["Facebook", "Instagram", "Twitter", "LinkedIn"],
    datasets: [
      {
        label: "Engagement",
        data: [120, 90, 75, 60],
        backgroundColor: "rgba(59, 130, 246, 0.7)"
      }
    ]
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Engagement Analytics</h1>
      <Bar data={data} />
    </div>
  );
};

export default AnalyticsView;
