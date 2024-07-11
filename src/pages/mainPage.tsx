
import Bar from "../components/Bar";
import MapContainer from "../components/map/MapContainer";

import { PRESIDENTIAL_RACE } from "../electionModel";
import { PresidentialRace } from "../electionModel/contests/presidentialRace";
import { getElectoralCollegeCounts, getRawVoteData } from "../electionModel/utils/utils";
import AreaChart from "../components/AreaChart";
import { getRollingAverage } from "../utils/utils";

function MainPage(){

    const prezData = PRESIDENTIAL_RACE.compute();

    const electoralCollegeData = getElectoralCollegeCounts(prezData.contestsWhole);
    const popularVoteData = getRawVoteData(PRESIDENTIAL_RACE.genericBallot.computeSeparate()!);

    const simulations = PRESIDENTIAL_RACE.simulate(PresidentialRace.defaultSimulationConfig, prezData);

    const electoralCollegeSimData = Object.keys(simulations.electoralVotes).map(key=>{return {x:parseInt(key), y:simulations.electoralVotes[parseInt(key)]}});

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
            <MapContainer prezData={prezData} />

            <div style={{height: "50px"}}></div>

            {/** Simulation */}
            <div>
                
                <AreaChart data={getRollingAverage(electoralCollegeSimData, 10)} color={"#ff0000"}/>
            </div>


            <div style={{height: "50px"}}></div>

            {/**  */}
        </div>
    )
}


export default MainPage;