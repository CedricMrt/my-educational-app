import { Line } from "react-chartjs-2";

interface ChartData {
  labels: string[];
  values: number[];
}

const Chart = ({ data }: { data: ChartData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Performance",
        data: data.values,
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return <Line data={chartData} />;
};

export default Chart;
