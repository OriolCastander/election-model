import dataJSON from "../../data/data.json";
import { PresidentialContestName } from "../../electionModel/contests/presidentialRace";
import { LITERAL_COLORS } from "../../utils/utils";


export interface MapElectorData{
    
    state: PresidentialContestName,

    /** Color of the elector */
    color: string,

    /** In pixels */
    top: number,

    /** In pixels */
    left: number,

    width: number,

    height: number,

}

export type MapElectorsData = {
    
    electors: MapElectorData[],
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,

    needsPreparing: boolean,
}

/**
 * Returns a list of semi-prepared data for electors (positions will need to be adjusted (putting them between min and max, corrent width and height))
 * along with metadata to prepare the final elector list
 * 
 */
export const getMapElectorsData = (colors: {[stateName in PresidentialContestName]: string}): MapElectorsData=>{

    const electorsData: MapElectorData[] = [];
    var minX = 0; var maxX = 0; var minY = 0; var maxY = 0;

    for (const stateName in dataJSON){
        const stateData = dataJSON[stateName as PresidentialContestName];

        const stateColor = colors[stateName as PresidentialContestName];

        for (const electorCoords of stateData.electors){

            if (electorCoords[0] < minX){minX = electorCoords[0];}
            else if (electorCoords[0] > maxX){maxX = electorCoords[0];}
            if (electorCoords[1] < minY){minY = electorCoords[1];}
            else if (electorCoords[1] > maxY){maxY = electorCoords[1];}

            const elector: MapElectorData = {
                state: stateName as PresidentialContestName,
                color: stateColor,
                left: electorCoords[0],
                top: electorCoords[1],
                width: 0, height: 0,
            }
            electorsData.push(elector);
        }
    }

    return {electors: electorsData, minX, maxX, minY, maxY, needsPreparing: true};
}

const INNER_SIZE = .8;

export function MapElector({data}: {data: MapElectorData}){

    const innerWidth = data.width * INNER_SIZE;
    const innerHeight = data.height * INNER_SIZE;
    const innerLeft = data.left + ((1 - INNER_SIZE) / 2) * data.width;
    const innerTop = data.top + ((1-INNER_SIZE) / 2) * data.height;


    return (
        <div style={{position: "absolute",
            width: innerWidth+"px",
            height: innerHeight+"px",
            left: innerLeft+"px",
            top: innerTop+"px",
            backgroundColor: data.color
        }}></div>
    );
}