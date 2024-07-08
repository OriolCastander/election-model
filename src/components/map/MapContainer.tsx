import React from 'react';
import { MapElector, getMapElectorsData, MapElectorsData, MapElectorData } from './MapElector';
import { PresidentialContestName, PresidentialRaceOutput } from '../../electionModel/contests/presidentialRace';
import { LITERAL_COLORS, mapObject } from '../../utils/utils';
import { Distribution } from '../../electionModel/distributions/distribution';
import { getDistributionColor } from '../../electionModel/utils/utils';

/** Percentage of padding in the map */
const MAP_PADDING = .08;


function MapContainer({prezData}: {prezData: PresidentialRaceOutput}){

    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const [highlightedState, setHighlightedState] = React.useState<PresidentialContestName | null>(null);
    
    const mapColors = mapObject<PresidentialContestName, Distribution, string>(prezData.contests, (distribution)=>LITERAL_COLORS[getDistributionColor(distribution)]);
    const [mapElectors, setMapElectors] = React.useState<MapElectorsData>(getMapElectorsData(mapColors)) as [MapElectorsData, (callback: (value: MapElectorsData) => MapElectorsData) => void];

    
    React.useEffect(()=>{

        /** Set the  mapContainer height and the electors stuff*/
        if (mapContainerRef.current != null && mapElectors.needsPreparing){

            mapElectors.needsPreparing = false;

            const width = mapContainerRef.current.offsetWidth;

            ///FIND THE RATIO
            const mapWidth = width * (1 - 2 * MAP_PADDING);
            const electorSize = mapWidth / (mapElectors.maxX - mapElectors.minX);
            const mapHeight = electorSize * (mapElectors.maxY - mapElectors.minY);
            const height = mapHeight / (1 - 2 * MAP_PADDING);

            mapContainerRef.current.style.height = height + "px";
            
            //UPDATE THE POSITIONS AND SIZES OF ELECTORS
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

    }, []);

    return (

        <div className="map-wrapper">
            <div style={{display: "flex", justifyContent:"space-between", width:"100%"}}>

                <div style={{display: "flex"}}> {/** PRES / HOUSE / SENATE BUTTONS */}
                    <button>PRESIDENT</button>
                    <button>HOUSE</button>
                    <button>SENATE</button>
                </div>

                <div style={{display: "flex"}}> {/** REAL OR ELECTORAL MAP */}

                    <button>GEOGRAPHIC</button>
                    <button>WEIGHTED</button>

                </div>
            </div>

            <div id="mapContainer" ref={mapContainerRef} style={{position: "relative"}}>
                
                { /** Not highlighted ones */
                mapElectors.electors.filter((elector)=>elector.state != highlightedState).map((elector)=>
                    <MapElector key={mapElectors.electors.indexOf(elector)} data={elector} />
                )}

                { /** Highlighted ones */
                mapElectors.electors.filter((elector)=>elector.state === highlightedState).map((elector)=>
                    <MapElector key={mapElectors.electors.indexOf(elector)} data={elector} />
                )}
                
            </div>

        </div>
    );
}


export default MapContainer;