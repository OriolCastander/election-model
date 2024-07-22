import { Distribution } from "./distribution";
import { NormalDistribution } from "./normalDistribution";


/**
 * 
 */
export class DiscreteDistribution extends Distribution{

    /**
     * The number of discrete points, also the length of the cdf array
     */
    public nPoints: number;

    public scaler: {
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
    public cdf: number[];


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
     * Transforms a normal distribution into a discrete one
     */
    static fromNormal(normalDist: NormalDistribution): DiscreteDistribution{

        const N_POINTS = 50; //PROBABLY SHOULD BE SET UP IN A CONFIG OR SOMETHING
        const N_STDS_TAIL = 3; // number of stds to include in the array

        const start = normalDist.mean - N_STDS_TAIL * normalDist.std;
        const end = normalDist.mean + N_STDS_TAIL * normalDist.std;

        const dx = (end - start) / N_POINTS;

        const cdf = [];
        for (let i=0; i<N_POINTS; i++){
            cdf.push(normalDist.getProbability(start + i * dx));
        }

        return new DiscreteDistribution(cdf, start, end);
    }

    /**
     * Combines a bunch of discrete dists into one
     * @param dists 
     * @param weights 
     * @param shouldFlathead the valley between 2 peaks is interpolated. Only works if there are 2 dists,
     * and their means are their peaks as well
     */
    static combineDiscretes(dists: DiscreteDistribution[], weights: number[] | null = null, shouldFlathead: boolean = false): DiscreteDistribution{

        if (weights == null){ //"EQUAL" weights if no weights are provided
            weights = new Array(dists.length).fill(1/dists.length);
        }

        if (dists.length != weights.length){
            throw new Error("Number of distributions and number of weights should be equal when combining them");
        }

        if (shouldFlathead == true && dists.length > 2){
            throw new Error("Can only flathead if there are 2 dists");
        }

        const newStart = Math.min(...dists.map(d=>d.scaler.start));
        const newEnd = Math.max(...dists.map(d=>d.scaler.end));
        const newDx = Math.min(...dists.map(d=>d.scaler.dx));

        const cdf = [];
        var currentPos = newStart;

        while (currentPos < newEnd + newDx){

            var currentValue = 0.0;
            for (let i=0; i<dists.length; i++){
                var distValue;
                const floatingIndex = (currentPos - dists[i].scaler.start) / dists[i].scaler.dx;
                const distIndex = Math.floor(floatingIndex);
                if (distIndex < 0){distValue = 0.0;}
                else if (distIndex >= dists[i].nPoints){distValue = 1.0;}
                else{
                    const distanceToPrevious = floatingIndex % 1;
                    const distanceToNext = 1 - distanceToPrevious;
                    distValue = dists[i].cdf[distIndex] * distanceToPrevious + dists[i].cdf[distIndex + 1] * distanceToNext;
                }

                currentValue += distValue * weights[i];
            }

            currentPos += newDx;
            cdf.push(currentValue);
        }

        if (shouldFlathead){
            const peaks = dists.map(d=>d.mean);
            peaks.sort((a,b)=>a-b)
            const indices = peaks.map((p)=>(p-newStart)/newDx);
            const startIndex = Math.ceil(indices[0]);
            const endIndex = Math.floor(indices[1]);

            for (let i=startIndex; i<=endIndex; i++){
                const percent = (newStart + newDx * i - indices[0]) / (indices[1] - indices[0]);
                cdf[i] = peaks[0] * percent + peaks[1] * (1 - percent);
            }
        }

        return new DiscreteDistribution(cdf, newStart, currentPos);
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

    getPdf(): number[]{

        return this.cdf.map((val, index)=>{

            if (index == 0){return 0;}
            else{return val - this.cdf[index - 1];}
        });
    }

    getPdfAsObjectList(): {x: number, y:number}[]{
        const arr = [];
        var currentX = this.scaler.start;
        var prevValue = 0;
        for (const value of this.cdf){
            arr.push({x: currentX, y: value - prevValue});
            currentX += this.scaler.dx;
            prevValue = value;
        }
        return arr;
    }

    /**
     * Returns the cdf as an object
     */
    getCdfAsObjectList(): {x: number, y: number}[]{
        const arr = [];
        var currentX = this.scaler.start;
        for (const value of this.cdf){
            arr.push({x: currentX, y:value});
            currentX += this.scaler.dx;
        }

        return arr;
    }
}