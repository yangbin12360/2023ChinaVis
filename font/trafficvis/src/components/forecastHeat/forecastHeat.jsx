import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import "./forecastHeat.css";
import { getFlow } from "../../apis/api";

const ForecastHeat = (props) => {
  const { flowTime,flowtimeStamp } = props;
  const heatRef = useRef(null);

  useEffect(() => {
    // console.log("flowtimeStamp",flowtimeStamp);
    getFlow(1681376400).then((res)=>{
      const flowData = Object.values(res["all"]);
  
      console.log("flowData",typeof(flowData));
      drawHeat(flowData);
    })
    // drawHeat();
  }, [flowtimeStamp]);

  const drawHeat = (colordata) => {
    const divHeight = heatRef.current.offsetHeight;
    const divWidth = heatRef.current.offsetWidth;
    const dimensions = {
      width: divWidth,
      height: divHeight,
      margin: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50,
      },
    };

    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.selectAll("div#heat svg").remove();

    const svg = d3
      .select("#heat")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .style("max-width", "100%")
      .style("background", "#efefef");

    const bounds = svg
      .append("g")
      .style(
        "transform",
        `translate(${0}px, ${dimensions.margin.top}px)`
      );
      const xScale = d3
      .scaleBand()
      .range([0, dimensions.width-5])
      .domain(d3.range(colordata[0].length)) 
      .padding(0.01);

    const yScale = d3
      .scaleBand()
      .range([0, dimensions.height-50])
      .domain(d3.range(colordata.length)) 
      .padding(0.01);

    const colorScale = d3.scaleSequential()
    .domain([d3.min(colordata, d => d3.min(d)), d3.max(colordata, d => d3.max(d))])
    .interpolator(t => d3.interpolateRgb(
      d3.rgb(61, 106, 79,0.7),  // 黄色
      t < 0.5
        ? d3.rgb(255, 224, 139)  // 橙色
        : d3.rgb(180, 32,13,0.9)   // 红色
    )(t * 2));

  const text = bounds.append("text")
                     .attr("x", dimensions.margin.left+15)
                     .attr("y",1)
                     .text(d3.min(colordata, d => d3.min(d))+"~"+d3.max(colordata, d => d3.max(d))+"辆")
// 创建渐变色块
const colorBlockWidth = 50;
const colorBlockHeight = 15;
const colorBlock = svg
  .append("rect")
  .attr("x", dimensions.margin.left-40)
  .attr("y",  8)
  .attr("width", colorBlockWidth)
  .attr("height", colorBlockHeight)
  .style("fill", "url(#color-gradient)")
// 创建渐变定义
const gradient = svg
  .append("defs")
  .append("linearGradient")
  .attr("id", "color-gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%")


// 定义渐变的颜色范围
gradient
  .append("stop")
  .attr("offset", "0%")
  .attr("stop-color", colorScale(d3.min(colordata, (d) => d3.min(d))))
  .attr("stop-opacity", 1);

gradient
  .append("stop")
  .attr("offset", "50%")
  .attr("stop-color", colorScale(d3.mean(colordata, (d) => d3.mean(d))))
  .attr("stop-opacity", 1);

gradient
  .append("stop")
  .attr("offset", "100%")
  .attr("stop-color", colorScale(d3.max(colordata, (d) => d3.max(d))))
  .attr("stop-opacity", 1);
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const rects = bounds
    .selectAll("rect")
    .data(
      colordata.flatMap((row, i) => row.map((value, j) => ({ i, j, value })))
    )
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.j))
    .attr("y", (d) => yScale(d.i)+10)
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.value))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("rx", 1) 
    .attr("ry", 1) 

    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration("50").attr("opacity", ".85");
      tooltip.transition().duration(50).style("opacity", 0.8);
      tooltip
        .html("车流量: " + d.value)
        .style("left", event.pageX + 10 + "px")  
        .style("top", event.pageY - 15 + "px");  
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration("50").attr("opacity", "1");
      tooltip.transition().duration("50").style("opacity", 0);
    });

    bounds
  .append("line")
  .attr("x1", xScale(colordata[0].length - 2))
  .attr("y1", -25)
  .attr("x2", xScale(colordata[0].length - 2))
  .attr("y2", boundedHeight+25)
  .style("stroke", "black")
  .style("stroke-dasharray", ("3, 3"));  
    // Create the x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(colordata[0].length))
      .tickFormat((d) =>
        d === colordata[0].length - 2
          ? "预测"
          : d === colordata[0].length - 1
          ? "真实"
          : `${d}`
      )
      .tickSize(0);

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${0}, ${
          dimensions.height - dimensions.margin.bottom+10
        })`
      )
      .call(xAxis)
      .select(".domain")
      .remove();
      const flowRect = svg.append("g").attr("transform", "translate(,0)");

    //   let gradient = svg
    //   .append("defs")
    //   .append("linearGradient")
    //   .attr("id", "gradient")
    //   .attr("x1", "0%")
    //   .attr("y1", "0%")
    //   .attr("x2", "100%")
    //   .attr("y2", "0%");
    // gradient
    //   .append("stop")
    //   .attr("offset", "0%")
    //   .attr("stop-color", colorScale(0))
    //   .attr("stop-opacity", 1);
    // gradient
    //   .append("stop")
    //   .attr("offset", "100%")
    //   .attr("stop-color", colorScale(1))
    //   .attr("stop-opacity", 1);
    // flowRect
    //   .append("rect")
    //   .attr("x", 20)
    //   .attr("y", 3)
    //   .attr("width", 50)
    //   .attr("height", 20)
    //   .style("fill", "url(#gradient)");
    // flowRect.append("text").attr("x", 80).attr("y", 18).text(d3.max(colordata, d => d3.max(d)));
    // const legend = svg
    //   .selectAll(".legend")
    //   .data(colorScale.ticks(6).slice(1).reverse())
    //   .enter()
    //   .append("g")
    //   .attr("class", "legend")
    //   .attr(
    //     "transform",
    //     (d, i) => `translate(${10}, ${40 + i * 20})`
    //   );

    // legend
    //   .append("rect")
    //   .attr("width", 20)
    //   .attr("height", 20)
    //   .style("fill", colorScale);

    // legend
    //   .append("text")
    //   .attr("x", -26)
    //   .attr("y", 10)
    //   .attr("dy", ".35em")
    //   .text(String);
  };
  return <div ref={heatRef} id="heat" className="container"></div>;
};

export default ForecastHeat;
