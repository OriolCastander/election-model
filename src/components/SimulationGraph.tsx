import ReactApexChart from "react-apexcharts";



function SimulationGraph({data}: {data: {xs?: number[], ys: number[]}}){

    const treatedData: {x:number, y: number}[] = [];
    for (var i=0; i<data.ys.length; i++){
        treatedData.push({x: data.xs![i], y:data.ys[i]})
    }
    const options: ApexCharts.ApexOptions = {
        chart: {
            type: "bar",
            background: "#fff",
        },

        xaxis: {labels: {show: false}},
        
    }

    return (
        <ReactApexChart series={[{name: "Electors", data: treatedData}]} options={options} type="bar" />

    );
}


export default SimulationGraph;