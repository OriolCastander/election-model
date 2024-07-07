
import {Distribution} from "../distributions/distribution";
import {NormalDistribution} from "../distributions/normalDistribution";
import { SeparateDistribution } from "../distributions/separateDistribution";



export class Contest{

    

    mockCompute(): Distribution{

        return new NormalDistribution(Math.random() * .1 - .05, Math.random() * .01 + .01)
    }


    mockComputeSeparate(): SeparateDistribution{
        
        const dem = new NormalDistribution(.48, .01);
        const rep = new NormalDistribution(.48, .01);

        return new SeparateDistribution(dem, rep);
    }

}