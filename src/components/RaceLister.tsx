import { PresidentialContestName } from "../electionModel/contests/presidentialRace";
import { DiscreteDistribution } from "../electionModel/distributions/discreteDistribution";
import { getRollingAverage } from "../utils/utils";
import AreaChart from "./AreaChart";
import MapContainer from "./map/MapContainer";
import { getMapStatesData } from "./map/MapStates";

import React from "react";

export interface RaceListerConfig{
    cutoff: number;
}

export type RaceRowData = {name: PresidentialContestName, distribution: DiscreteDistribution};

function RaceLister({data, config}: {data: RaceRowData[], config: RaceListerConfig}){

    return (
        <div>
            {data.map((rowData, index)=><RaceRow key={index} data={rowData} config={config} />)}
        </div>
    );
}



export default RaceLister;



function RaceRow({data, config}: {data: RaceRowData, config: RaceListerConfig}){

    const rowContainerRef = React.useRef<HTMLDivElement>(null);
    const mapDivRef = React.useRef<HTMLDivElement>(null);

    const mapColor = "#ffff00";//LITERAL_COLORS[getDistributionColor(data.distribution)];
    const mapColors: {[name in PresidentialContestName]?: string} = {};
    mapColors[data.name] = mapColor;

    /**
     * Gets the dem and rep colors assuming that the change is at 0
     */
    const getChartColors = (chartData: {x:number,y:number}[]): {start: number, end: number, color:string}[]=>{
        
        if (chartData[0].x > 0){//ONLY DEMS
            return [{start: chartData[0].x, end: chartData.at(-1)!.x, color: "#0000ff"}];
        }

        if (chartData.at(-1)!.x < 0){ //ONLY REPS
            return [{start: chartData[0].x, end: chartData.at(-1)!.x, color: "#ff0000"}];
        }

        ///DEM AND REPS
        const rep = {start: chartData[0].x, end: 0, color: "#ff0000"};
        const dem = {start: 0, end: chartData.at(-1)!.x, color: "#0000ff"};
        return [rep, dem];
    }

    //FILTER CHART DATA WITH THE CONFIG
    var chartData = data.distribution.getPdfAsObjectList().filter((value)=>Math.abs(value.x)<config.cutoff);
    chartData.push({x: config.cutoff, y: 0.0});
    chartData.unshift({x: -config.cutoff, y: 0.0});

    chartData = getRollingAverage(chartData, .004, .002);

    const chartColors = getChartColors(chartData);

    //USE EFFECT TO CENTER THE IMAGE MAP TO THE APPROPIATE PLACE
    React.useEffect(()=>{
        if (rowContainerRef.current != null && mapDivRef.current != null){

            const width = rowContainerRef.current.offsetWidth;
            const center = (1 - (data.distribution.mean + config.cutoff) / (2 * config.cutoff)) * width;
            mapDivRef.current.style.left = (center - mapDivRef.current.offsetWidth / 2) + "px"; 
        }
        

    },[]);

    return (
        <div style={{width:"100%", height:"50px", marginBottom: "30px"}} ref={rowContainerRef}>

            <AreaChart data={chartData} color={chartColors} config={{xMin: -config.cutoff, xMax: config.cutoff, isReversed: true}}/>
            <div style={{position: "relative", top: "-40px", width: "50px", height: "50px"}} ref={mapDivRef}>
                <MapContainer predata={{states: getMapStatesData(mapColors)}}  config={{}} />
            </div>
        </div>
    ); 
}