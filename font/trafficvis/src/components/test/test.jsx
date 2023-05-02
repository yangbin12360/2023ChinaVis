import React, { useEffect, useRef} from "react";
import { getJson } from "../../apis/api";
import * as d3 from "d3";

const Test = (props) => {
  const ref = useRef();
  const width = 800;
  const height = 800;
  const mapName = ['boundary','crosswalk','lane','signal','stopline']
  useEffect(() => {

    getJson().then((res) => {
      console.log("res", res);
      const geoJsonData = res
      drawGeoJson(geoJsonData);
    });
  }, []);
  const drawGeoJson = (geoJsonData) => {
    const svgParent = d3.select(ref.current)
    .attr('width', 1000)
    .attr('height', 1000);

    for(let i=0;i<mapName.length;i++){
    // 为地图创建投影
    const projection = d3.geoIdentity()
  .fitSize([width, height], geoJsonData[mapName[i]]);
    console.log("projection", projection);
    // 创建路径生成器并使用投影
    const path = d3.geoPath().projection(projection);
    const svg = svgParent
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    // console.log("path",path);
    console.log('geoJsonData[mapName[i]].features',geoJsonData[mapName[i]].features);
    // 选择SVG并设置宽度和高度
    svg.selectAll('path')
      .data(geoJsonData[mapName[i]].features)
      .join('path')
      .attr('d', path)
      .attr('fill', (d,i)=>{
        console.log("d",d)
        return "red";
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 1);
// }
}
}
return (<>
  <svg ref={ref}></svg>
</>);
};

export default Test;
