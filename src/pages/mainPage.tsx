
import Bar from "../components/Bar";
import MapContainer from "../components/map/MapContainer";

import { PRESIDENTIAL_RACE } from "../electionModel";
import { getElectoralCollegeCounts, getRawVoteData } from "../electionModel/utils/utils";

function MainPage(){

    const prezData = PRESIDENTIAL_RACE.mockCompute();

    const electoralCollegeData = getElectoralCollegeCounts(prezData.states);
    const popularVoteData = getRawVoteData(PRESIDENTIAL_RACE.genericBallot.mockComputeSeparate());

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
                SIMULATION
            </div>
        </div>
    )
}


export default MainPage;