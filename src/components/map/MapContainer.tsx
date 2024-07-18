import React from 'react';
import { MapElector, MapElectorsData } from './MapElector';
import { PresidentialContestName } from '../../electionModel/contests/presidentialRace';
import { MapStatesData, MapStatePolygon } from './MapStates';

/** Percentage of padding in the map */
const MAP_PADDING = .08;

type MapMode = "States" | "Electors";

export interface MapConfig{

    /** List of possible modes the map can be in */
    mapModes?: MapMode[],

    contestSwitch?: boolean,
}

/**
 * Modifies the map config and fills it with the default values
 */
const fillMapConfig = (config: MapConfig): void=>{

    config.mapModes ??= ["States"];
    config.contestSwitch ??= false;
}

function MapContainer({predata, config}: {predata: {electors?: MapElectorsData, states?: MapStatesData}, config: MapConfig}){

    fillMapConfig(config);

    const mapContainerRef = React.useRef<HTMLDivElement>(null);

    const [highlightedState, setHighlightedState] = React.useState<PresidentialContestName | null>(null);

    const [mapMode, setMapMode] = React.useState<MapMode>("States");
    
    const [mapElectors, setMapElectors] = React.useState<MapElectorsData | null>(predata.electors ?? null) as [MapElectorsData, (callback: (value: MapElectorsData) => MapElectorsData) => void];
    const [mapStates, setMapStates] = React.useState<MapStatesData | null>(predata.states ?? null) as [MapStatesData, (callback: (value: MapStatesData) => MapStatesData) => void];

    React.useEffect(()=>{
        if (mapContainerRef.current != null){

            const mapData = mapMode == "States" ? mapStates : mapElectors;

            const width = mapContainerRef.current.offsetWidth;
            const mapWidth = width * (1 - 2 * MAP_PADDING);
            const electorSize = mapWidth / (mapData.maxX - mapData.minX);
            var mapHeight: number;

            ///FIND THE RATIO
            if (mapMode == "Electors"){
                
                mapHeight = electorSize * (mapData.maxY - mapData.minY);
            }else if (mapMode == "States"){
                mapHeight = mapWidth * (mapData.maxY - mapData.minY) / (mapData.maxX - mapData.minX)
            }else{
                throw new Error("Undefined map mode " + mapMode);
            }
            
            const height = mapHeight / (1 - 2 * MAP_PADDING);
            mapContainerRef.current.style.height = height + "px";


            if (mapMode === "Electors" && mapElectors.needsPreparing){
                //UPDATE THE MAP ELECTORS STUFF
                setMapElectors((prevMapElectors)=>{return {...prevMapElectors,needsPreparing: false};});

                for (const [i, elector] of mapElectors.electors.entries()){

                    const left = ((elector.left - mapElectors.minX) / (mapElectors.maxX - mapElectors.minX) + MAP_PADDING) * mapWidth;
                    const top = ((elector.top - mapElectors.minY) / (mapElectors.maxY - mapElectors.minY) + MAP_PADDING) * mapHeight;
                    const width = electorSize;
                    const height = electorSize;
                    
                    setMapElectors((prevMapElectors)=>{
                        const newElectors = prevMapElectors.electors;
                        newElectors[i].left = left;
                        newElectors[i].top = top;
                        newElectors[i].width = width;
                        newElectors[i].height = height;
                        return {...prevMapElectors};
                    });
                }
            }

            if (mapMode == "States" && mapStates.needsPreparing){
                setMapStates((prevMapStates)=>{return {...prevMapStates,needsPreparing: false};});

                for (const [i, statePolygon] of mapStates.polygons.entries()){
                    for (const [j, coord] of statePolygon.coords.entries()){
                        
                        const x = ((coord.x - mapStates.minX) / (mapStates.maxX - mapStates.minX) + MAP_PADDING) * mapWidth;
                        const y = ((coord.y - mapStates.minY) / (mapStates.maxY - mapStates.minY) + MAP_PADDING) * mapHeight;

                        setMapStates((prevMapStates)=>{
                            const newPol = prevMapStates.polygons;
                            newPol[i].coords[j].x = x;
                            newPol[i].coords[j].y = y;
                            return {...prevMapStates};
                        });
                    }
                }
            }
        }

    }, [mapMode, mapStates]); //we may be able to not have mapStates here


    const getElectorsMap = ()=>{
        return <div style={{position: "relative", width: "100%", height: "100%"}}>
            { /** Not highlighted ones */
            mapElectors.electors.filter((elector)=>elector.state != highlightedState).map((elector)=>
                <MapElector key={mapElectors.electors.indexOf(elector)} data={elector} />
            )}

            { /** Highlighted ones */
            mapElectors.electors.filter((elector)=>elector.state === highlightedState).map((elector)=>
                <MapElector key={mapElectors.electors.indexOf(elector)} data={elector} />
            )}
        </div>
    }

    const getStatesMap = ()=>{
        return <svg style={{position: "relative", width: "100%", height: "100%"}}>
            { /** Not highlighted ones */
            mapStates.polygons.filter((polygon)=>polygon.state != highlightedState).map((polygon)=>
                <MapStatePolygon key={mapStates.polygons.indexOf(polygon)} data={polygon} />
            )}

            { /** Highlighted ones */
            mapStates.polygons.filter((polygon)=>polygon.state == highlightedState).map((polygon)=>
                <MapStatePolygon key={mapStates.polygons.indexOf(polygon)} data={polygon} />
            )}  
        </svg>
    }

    return (

        <div className="map-wrapper">
            <div style={{display: "flex", justifyContent:"space-between", width:"100%"}}>

                {config.contestSwitch ? <div style={{display: "flex"}}> {/** PRES / HOUSE / SENATE BUTTONS */}
                    <button>PRESIDENT</button>
                    <button>HOUSE</button>
                    <button>SENATE</button>
                </div> : <></>}

                <div style={{display: "flex"}}> {/** REAL OR ELECTORAL MAP */}

                    {config.mapModes!.length > 1 && config.mapModes!.includes("States") ? 
                        <button onClick={()=>{setMapMode("States")}}>GEOGRAPHIC</button> :
                        <></>}

                    {config.mapModes!.length > 1 && config.mapModes!.includes("Electors") ? 
                        <button onClick={()=>{setMapMode("Electors")}}>ELECTORS</button> :
                        <></>}

                </div>
            </div>

            <div id="mapContainer" ref={mapContainerRef} style={{position: "relative"}}>
                {mapMode === "Electors" ? getElectorsMap() : getStatesMap()}                
                
            </div>

        </div>
    );
}


export default MapContainer;