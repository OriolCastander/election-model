import React from 'react';
import { MapElector, getMapElectorsData, MapElectorsData, MapElectorData } from './MapElector';
import { PresidentialContestName, PresidentialRaceOutput } from '../../electionModel/contests/presidentialRace';
import { LITERAL_COLORS, mapObject } from '../../utils/utils';
import { Distribution } from '../../electionModel/distributions/distribution';
import { getDistributionColor } from '../../electionModel/utils/utils';
import { MapStatesData, getMapStatesData, MapStatePolygon } from './MapStates';

/** Percentage of padding in the map */
const MAP_PADDING = .08;

function MapContainer({prezData}: {prezData: PresidentialRaceOutput}){

    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapCanvasRef = React.useRef<HTMLCanvasElement>(null);

    const [highlightedState, setHighlightedState] = React.useState<PresidentialContestName | null>(null);

    const [mapMode, setMapMode] = React.useState<"States" | "Electors">("States");
    
    const mapColors = mapObject<PresidentialContestName, Distribution, string>(prezData.contestsWhole, (distribution)=>LITERAL_COLORS[getDistributionColor(distribution)]);
    const [mapElectors, setMapElectors] = React.useState<MapElectorsData>(getMapElectorsData(mapColors)) as [MapElectorsData, (callback: (value: MapElectorsData) => MapElectorsData) => void];

    const [mapStates, setMapStates] = React.useState<MapStatesData>(getMapStatesData(mapColors)) as [MapStatesData, (callback: (value: MapStatesData) => MapStatesData) => void];

    ///PREPARE 
    React.useEffect(()=>{
        if (mapContainerRef.current != null){

            const mapData = mapMode == "States" ? mapStates : mapElectors;

            const width = mapContainerRef.current.offsetWidth;

            ///FIND THE RATIO
            const mapWidth = width * (1 - 2 * MAP_PADDING);
            const electorSize = mapWidth / (mapData.maxX - mapData.minX);
            const mapHeight = electorSize * (mapData.maxY - mapData.minY);
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

    }, [mapMode, mapStates]);


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

                <div style={{display: "flex"}}> {/** PRES / HOUSE / SENATE BUTTONS */}
                    <button>PRESIDENT</button>
                    <button>HOUSE</button>
                    <button>SENATE</button>
                </div>

                <div style={{display: "flex"}}> {/** REAL OR ELECTORAL MAP */}

                    <button onClick={()=>{setMapMode("States")}}>GEOGRAPHIC</button>
                    <button onClick={()=>{setMapMode("Electors")}}>WEIGHTED</button>

                </div>
            </div>

            <div id="mapContainer" ref={mapContainerRef} style={{position: "relative"}}>
                {mapMode === "Electors" ? getElectorsMap() : getStatesMap()}                
                
            </div>

        </div>
    );
}


export default MapContainer;