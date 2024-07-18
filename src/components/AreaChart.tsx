import React from 'react';




interface AreaChartConfig {
    xMin?: number,
    yMin?: number,
    xMax?: number,
    yMax?: number,

    isReversed?: boolean,
}

function AreaChart({data, color, config}: {data: {x: number, y: number}[], color: string | {start: number, end: number, color: string}[], config: AreaChartConfig}){

    var colors: {start: number, end: number, color: string}[];

    if (typeof color == "string"){
        colors = [{start: data[0].x, end: data.at(-1)!.x, color: color}];
    }else{
        colors = color;
    }

    const svgRef = React.useRef<SVGSVGElement>(null);

    const [scaledData, setScaledData] = React.useState<{points: {x: number, y: number}[], color:string}[]>([]);

    const xMin = config.xMin ?? data[0].x;
    const xMax = config.xMax ?? data.at(-1)!.x;
    const yMin = config.yMin ?? Math.min(...data.map(el=>el.y));
    const yMax = config.yMax ?? Math.max(...data.map(el=>el.y));

    React.useEffect(()=>{
        if (svgRef.current != null){
            const width = svgRef.current.width.baseVal.value;
            const height = svgRef.current.height.baseVal.value;

            const newScaledData: {points: {x: number, y: number}[], color:string}[] = [];
            var currentDataIndex = 0;
            for (const colorSegment of colors){

                const polygonData: {points: {x: number, y: number}[], color:string} = {points: [], color: colorSegment.color};
                //GET START VALUES
                polygonData.points.push({x: colorSegment.start, y: yMin});

                var foundValue = false;
                for (var i=currentDataIndex; i<data.length-1; i++){
                    if (Math.abs(colorSegment.start - data[i].x) < .000001){
                        polygonData.points.push({x: colorSegment.start, y:data[i].y});
                        currentDataIndex = i;
                        foundValue = true;
                        break;
                    }
                    else if (colorSegment.start > data[i].x){
                        polygonData.points.push(data[i]);
                    }
                    else{
                        const distanceToPrev = Math.abs(colorSegment.start - data[i].x);
                        const distanceToNext = Math.abs(colorSegment.start - data[i+1].x);
                        
                        //INTERPOLATE THE VALUE
                        const value = (data[i].y * distanceToPrev + data[i+1].y * distanceToNext) / (distanceToNext + distanceToPrev);
                        polygonData.points.push({x: colorSegment.start, y: value});
                        currentDataIndex = i;
                        foundValue = true;
                        break;
                    }
                }

                if (!foundValue){
                    throw Error("Cannot find start value in area chart");
                }
                
                foundValue = false;

                ///GET END VALUES
                for (var i=currentDataIndex; i<data.length; i++){ //SOULD NOT THROW BECAUSE OF OVERFLOW IN I+1
                    if (Math.abs(colorSegment.end - data[i].x) < .000001){
                        polygonData.points.push({x: colorSegment.end, y:data[i].y});
                        currentDataIndex = i;
                        foundValue = true;
                        break;
                    }
                    else if (colorSegment.end > data[i].x){
                        polygonData.points.push(data[i]);
                    }
                    else{
                        const distanceToPrev = Math.abs(colorSegment.end - data[i].x);
                        const distanceToNext = Math.abs(colorSegment.end - data[i+1].x);
                        
                        //INTERPOLATE THE VALUE
                        const value = (data[i].y * distanceToPrev + data[i+1].y * distanceToNext) / (distanceToNext + distanceToPrev);
                        polygonData.points.push({x: colorSegment.end, y: value});
                        currentDataIndex = i;
                        foundValue = true;
                        break;
                    }
                }

                if (!foundValue){
                    throw Error("Cannot find end value");
                }

                polygonData.points.push({x: colorSegment.end, y: yMin});

                newScaledData.push({...polygonData, points: polygonData.points.map((p)=>{
                    var xVal: number;
                    if (config.isReversed){
                        xVal = (1-(p.x - xMin)/(xMax - xMin))*width;
                    }else{
                        xVal = (p.x - xMin)/(xMax - xMin)*width;
                    }

                    const yVal = (1-(p.y-yMin)/(yMax-yMin))*height;
                    return {x: xVal, y: yVal};
                })});
                
            }

            //const newScaledData = data.map((point)=>{return {x: (1-(point.x - xMin) / (xMax - xMin)) * width, y: (1-(point.y - yMin) / (yMax - yMin)) * height}});
            setScaledData(newScaledData);
        }
    }, []);


    return (
        <svg ref={svgRef} style={{width:"100%", height:"100%"}}>
            {scaledData.map((sd,index)=>{
                const polyString = sd.points.map(p=> p.x + "," + p.y).join(" ");
                return <polygon key={index} points={polyString} stroke={sd.color} fill={sd.color + "88"} />
            })}

        </svg>
    );
    
}


export default AreaChart;