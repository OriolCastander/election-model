
import Bar from "../components/Bar";
import MapContainer from "../components/map/MapContainer";

import { PRESIDENTIAL_RACE } from "../electionModel";
import { PresidentialContestName, PresidentialRace } from "../electionModel/contests/presidentialRace";
import { getBattleGroundContests, getDistributionColor, getElectoralCollegeCounts, getRawVoteData } from "../electionModel/utils/utils";
import AreaChart from "../components/AreaChart";
import { LITERAL_COLORS, getRollingAverage, mapObject } from "../utils/utils";
import RaceLister, { RaceRowData } from "../components/RaceLister";
import { getMapElectorsData } from "../components/map/MapElector";
import { Distribution } from "../electionModel/distributions/distribution";
import { getMapStatesData } from "../components/map/MapStates";

function MainPage(){

    const prezData = PRESIDENTIAL_RACE.compute();

    //ELECTORAL COLLEGE SUTFF
    const electoralCollegeData = getElectoralCollegeCounts(prezData.contestsWhole);
    const popularVoteData = getRawVoteData(PRESIDENTIAL_RACE.genericBallot.computeSeparate()!);

    const electoralMapColors = mapObject<PresidentialContestName, Distribution, string>(prezData.contestsWhole, (distribution)=>LITERAL_COLORS[getDistributionColor(distribution)]);
    

    //SIMULATION STUFF
    const simulations = PRESIDENTIAL_RACE.simulate(PresidentialRace.defaultSimulationConfig, prezData);

    const electoralCollegeSimData = Object.keys(simulations.electoralVotes).map(key=>{return {x:parseInt(key), y:simulations.electoralVotes[parseInt(key)]}});
    const electoralCollegeSimColors: {start: number, end: number, color:string}[] = [{start: 0, end:269, color: "#ff0000"}, {start:269,end:538,color:"#0000ff"}];

    const battleGroundContestsNames = getBattleGroundContests(simulations.contests, mapObject(PRESIDENTIAL_RACE.contests, (c)=>c.electoralVotes), 10);
    
    const battlegroundContestsChartData: RaceRowData[] = battleGroundContestsNames.map((cn)=>{
        return {
            name: cn,
            distribution: simulations.contests[cn],
            chartData: simulations.contests[cn].getPdfAsObjectList(),
        };
    });

    return (
        <div>
            {/** BARS */}
            <div>

                {/** Electoral college + popular vote */}
                <div style={{display:"flex"}}>

                    <div className="bar-marker">
                        <p>BIDEN</p>
                    </div>

                    <div style={{width: "100%", display: "flex", flexDirection: "column"}}>
                        <Bar title="ELECTORAL COLLEGE" data={electoralCollegeData} />
                        <Bar title="POPULAR VOTE" data={popularVoteData} />
                    </div>
                    

                    <div className="bar-marker" style={{textAlign: "right"}}>
                        <p>TRUMP</p>
                    </div>



                </div>


                {/** SENATE + HOUSE */}
                <div style={{display:"flex"}}>

                    <div className="bar-marker">
                        <p>DEMS</p>
                    </div>

                    <div style={{width: "100%", display: "flex", flexDirection: "column"}}>
                        <Bar title="HOUSE" data={electoralCollegeData} />
                        <Bar title="SENATE" data={popularVoteData} />
                    </div>
                    

                    <div className="bar-marker" style={{textAlign: "right"}}>
                        <p>REPS</p>
                    </div>



                </div>

                

            </div>

            <div style={{height: "50px"}}></div>

            {/** MAPS */}
            <MapContainer
                predata={{electors: getMapElectorsData(electoralMapColors), states: getMapStatesData(electoralMapColors)}}
                config={{mapModes: ["States", "Electors"]}} 
            />

            <div style={{height: "50px"}}></div>

            {/** Simulation */}
            <div>
                <h4>OUR SIMULATION</h4>
                <p>This is our simulation for the electoral college bla bla bla</p>
                <AreaChart data={getRollingAverage(electoralCollegeSimData, 10)} color={electoralCollegeSimColors} config={{isReversed: true}}/>
            </div>


            <div style={{height: "50px"}}></div>

            {/** Battlegorund states */}
            <div>
                <h4>BATTLEGROUND STATES</h4>
                <RaceLister data={battlegroundContestsChartData}  config={{cutoff: .2}}/>


            </div>
        </div>
    )
}


export default MainPage;