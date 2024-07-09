import { Distribution } from "./distribution";


/**
 * 
 */
export class DiscreteDistribution extends Distribution{

    /**
     * The number of discrete points, also the length of the cdf array
     */
    private nPoints: number;

    private scaler: {
        /** The corresponding (x) value for the 0th element of the cdf array */
        start: number,

        /** The corresponding (x) value for the last element of the cdf array  */
        end: number,

        /** The legth of the discrete "step". (end - start) / nPoints */
        dx: number,
    };

    /**
     * The cumulative probability at those indexes (first is guaranteed 0, last is guaranteed 1)
     */
    private cdf: number[];


    constructor(cdf: number[], start: number, end: number){

        super(NaN); //DUMMY INIT FOR THE DISTRIBUTION, AS MEAN WILL BE COMPUTED LATER
        
        this.nPoints = cdf.length;
        this.cdf = cdf;

        this.scaler = {start: start, end: end, dx: (end - start) / this.nPoints};

        this.mean = this.getValue(.5);
    }
    
    /**
     * Constructs a discrete distribution from an array
     */
    static fromArray(array: number[], nPoints: number): DiscreteDistribution{

        array.sort((a,b)=>a-b);

        const cdf: number[] = [0.0];

        const dx = (array.at(-1)! - array[0]) / nPoints;
        var currentXPos = array[0] + dx;

        var arrayIndex = 0;

        for (var i=1; i<nPoints; i++){

            while (true){
                if (array[arrayIndex] < currentXPos){arrayIndex += 1;}
                else{break;}
                
            }
            cdf.push(arrayIndex / array.length);
            currentXPos += dx;
        }

        return new DiscreteDistribution(cdf, array[0], array.at(-1)!);
    }


    /**
     * Returns the probability that the value is below a certain cutoff
     */
    getProbability(cutoff: number): number {
    
        //OUT OF BOUNDS CASES
        if (cutoff <= this.scaler.start){return 0.0;}
        if (cutoff >= this.scaler.end){return 1.0;}

        const index = (cutoff - this.scaler.start) / this.scaler.dx;
        const indexBelow = Math.round(index);
        const percentageBelow = index % 1;

        return this.cdf[indexBelow] * percentageBelow + this.cdf[indexBelow + 1] * (1 - percentageBelow);
        
    }

    /**
     * Returns a random value
     */
        getRandom(): number {
        
            return this.getValue(Math.random());
        }

    /**
     * Returns the (x-axis) value that would have that probability
     */
    getValue(probability: number): number{
        //"OUT OF BOUNDS" CASES
        if (probability <= 0){return this.scaler.start;}
        if (probability >= 1){return this.scaler.end;}

        for (var indexAbove=1; indexAbove<this.nPoints; indexAbove++){

            if (probability < this.cdf[indexAbove]){
                break;
            }
        }

        //INTERPOLATE BETWEEN THE INDEX ABOVE AND BELOW
        const indexBelow = indexAbove - 1;

        const percentageFromBelow = (probability - this.cdf[indexBelow]) / (this.cdf[indexAbove] - this.cdf[indexBelow]);

        return this.scaler.start + this.scaler.dx * (indexBelow + percentageFromBelow);
    }
}