import React from 'react';





function AreaChart({data, color}: {data: {x: number, y: number}[], color: string | {start: number, end: number, color: number}[]}){

    const svgRef = React.useRef<SVGSVGElement>(null);

    const [scaledData, setScaledData] = React.useState<{x: number, y: number}[]>([]);

    const xMin = data[0].x;
    const xMax = data.at(-1)!.x;
    const yMin = Math.min(...data.map(el=>el.y));
    const yMax = Math.max(...data.map(el=>el.y));

    React.useEffect(()=>{
        if (svgRef.current != null){
            const width = svgRef.current.width.baseVal.value;
            const height = svgRef.current.height.baseVal.value;

            const newScaledData = data.map((point)=>{return {x: (1-(point.x - xMin) / (xMax - xMin)) * width, y: (1-(point.y - yMin) / (yMax - yMin)) * height}});
            setScaledData(newScaledData);
        }
    }, []);

    //const polygonString = scaledData.map((point)=> point.x+"," + point.y).join(" ");

    return (
        <svg ref={svgRef} style={{width:"100%", height:"100%"}}>
            <polygon points={scaledData.map((point)=> point.x+"," + point.y).join(" ")} stroke={color as string} fill={(color as string)+"55"}/>
        </svg>
    );
    
}


export default AreaChart;