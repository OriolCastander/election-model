/**
 * Stuff related to populating a map with the states geojson
 */


import dataJSON from "../../data/data.json";
import { PresidentialContestName } from "../../electionModel/contests/presidentialRace";



export interface MapPolygonData{

    state: PresidentialContestName,

    color: string,

    /** Array of positions (absolute, in pixels) of the coords of the points of the polygon. [[p1.x, p1.y], [p2.x, p2.y]...] */
    coords: {x: number, y: number}[],
}

/**
 * Data (and metadata for the mapStates)
 */
export type MapStatesData = {
    
    polygons: MapPolygonData[],
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,

    needsPreparing: boolean,
}


/**
 * Returns a list of semi-prepared data for polygons (positions will need to be adjusted (putting them between min and max, corrent width and height))
 * along with metadata to prepare the final list
 */

export const getMapStatesData = (colors: {[stateName in PresidentialContestName]?: string}): MapStatesData=>{


    const polygons: MapPolygonData[] = [];

    var minX = Infinity; var maxX = -Infinity; var minY = Infinity; var maxY = -Infinity;
    for (const stateName in colors){
        const stateColor = colors[stateName as PresidentialContestName]!;

        const statePolygonsData = getMapStateData(stateName as PresidentialContestName, stateColor);
        if (statePolygonsData.maxX > maxX){maxX = statePolygonsData.maxX;}
        if (statePolygonsData.minX < minX){minX = statePolygonsData.minX;}
        if (statePolygonsData.maxY > maxY){maxY = statePolygonsData.maxY;}
        if (statePolygonsData.minY < minY){minY = statePolygonsData.minY;}

        polygons.push(...statePolygonsData.polygons);
    }


    return {polygons, minX, maxX, minY, maxY, needsPreparing: true};

}

/**
 * Returns a list of semi-prepared data for polygons (positions will need to be adjusted (putting them between min and max, corrent width and height))
 * along with metadata to prepare the final list for one state
 */
const getMapStateData = (stateName: PresidentialContestName, color: string): MapStatesData=>{

    const polygons: MapPolygonData[] = [];

    var minX = Infinity; var maxX = -Infinity; var minY = Infinity; var maxY = -Infinity;

    const stateData = dataJSON[stateName];

    var polygonsData: number[][][][];
    if (stateData.geometry.type === "Polygon"){
        polygonsData = [stateData.geometry.coordinates as number[][][]];
    }else if (stateData.geometry.type === "MultiPolygon"){
        polygonsData = stateData.geometry.coordinates as number[][][][];
    }else{throw Error("Unrecognized geojson shape " + stateData.geometry.type + " in data.json state" + stateName)}

    for (const polygon of polygonsData){
        const coords = polygon[0];

        const xs = coords.map(coord=>coord[0]);
        const ys = coords.map(coord=>1-coord[1]);
        
        minX = Math.min(minX, ...xs);
        maxX = Math.max(maxX, ...xs);
        minY = Math.min(minY, ...ys);
        maxY = Math.max(maxY, ...ys);

        const polygonData: MapPolygonData = {
            state: stateName,
            color: color,
            coords: coords.map((coord)=>{return {x: coord[0], y: 1-coord[1]};}),
        }

        polygons.push(polygonData);

    }

    return {polygons, minX, maxX, minY, maxY, needsPreparing: true};

}


export function MapStatePolygon({data}: {data: MapPolygonData}){

    var polygonPointsString = "";
    for (const coord of data.coords){
        polygonPointsString += coord.x + "," + coord.y + " ";
    }

    return (
        <polygon points={polygonPointsString} fill={data.color} stroke="black" />
    );
}