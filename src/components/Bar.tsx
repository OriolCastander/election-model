
import { ContestColor } from "../electionModel/utils/utils";
import { LITERAL_COLORS } from "../utils/utils";

/**
 * The data that the bar should display
 */
export type BarData = {[kind in ContestColor]?: number};

function Bar({title, data}: {title: string, data: BarData}){

    const total = Object.values(data).reduce((acc, val)=> acc + val);
    const repTotal = (data.LeanRep ?? 0) + (data.LikelyRep ?? 0) + (data.SafeRep ?? 0);
    const demTotal = (data.LeanDem ?? 0) + (data.LikelyDem ?? 0) + (data.SafeDem ?? 0);

    return (
        <div className="bar">
            <div style={{display: "flex", justifyContent: "center"}}>
                <h4>{title}</h4>
            </div>

            <div style={{display: "flex"}}>
                <div className="bar-marker" style={{minWidth: "50px"}}>{demTotal < 1 ? (demTotal * 100)+"%" : demTotal}</div>

                <div style={{display: "flex", width: "100%"}}>
                    {Object.keys(data).map((key)=>{
                        const val = data[key as ContestColor]!;
                        const color = LITERAL_COLORS[key as ContestColor];
                        return <div key={key} style={{width: (val / total * 100)+"%", backgroundColor: color}}> </div>
                    })}
                </div>
                
                <div className="bar-marker" style={{minWidth: "50px", textAlign: "right"}}>{repTotal < 1 ? (repTotal * 100)+"%" : repTotal}</div>
            </div>
        </div>
    );

}


export default Bar;