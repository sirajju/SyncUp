import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
export default function ({xValues,yValues,barColors}) {
    const data = {
        labels: xValues,
        datasets: [{
            data: yValues,
            borderWidth: 1,
            backgroundColor: barColors
        }]
    }
    const options = {
        responsive: true,
        maintainAspectRatio: false, 
        aspectRatio: 1,
        width: 50, 
        height: 20
    };
    return (
        <Doughnut options={options}  data={data}/>
    )
}