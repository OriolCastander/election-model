
import {Distribution} from "../distributions/distribution";
import {NormalDistribution} from "../distributions/normalDistribution";
import { SeparateDistribution } from "../distributions/separateDistribution";



export class Contest{

    /**
     * Symbolizes the difference between the contest's sentiment and the environment "above"
     * I.e. in a presidential contest, this symbolizes how much right or left the contest is from the
     * national environment
     */
    public uniqueness: Distribution;

    constructor(uniqueness: Distribution = new NormalDistribution(0,0)){
        this.uniqueness = uniqueness;
    }
    

    mockCompute(): Distribution{

        return new NormalDistribution(Math.random() * .1 - .05, Math.random() * .01 + .01)
    }


    mockComputeSeparate(): SeparateDistribution{
        
        const dem = new NormalDistribution(.48, .01);
        const rep = new NormalDistribution(.48, .01);

        return new SeparateDistribution(dem, rep);
    }

}