import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import "./forecastHeat.css";
import { getFlow } from "../../apis/api";

const ForecastHeat = (props) => {
  const { flowTime,flowtimeStamp } = props;
  //console.log(flowtimeStamp)
  const heatRef = useRef(null);

  useEffect(() => {
    getFlow(flowTime).then((res)=>{
      const flowData = Object.values(res["all"]);
      
      console.log("flowData",typeof(flowData));
      drawHeat(flowData);
    })
    // drawHeat();
  }, [flowTime]);

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
      .style("background", "#fff");

    const bounds = svg
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );
      const xScale = d3
      .scaleBand()
      .range([0, boundedWidth])
      .domain(d3.range(colordata[0].length)) 
      .padding(0.01);

    const yScale = d3
      .scaleBand()
      .range([0, boundedHeight])
      .domain(d3.range(colordata.length)) 
      .padding(0.01);

    const colorScale = d3.scaleSequential()
    .domain([d3.min(colordata, d => d3.min(d)), d3.max(colordata, d => d3.max(d)/4)])
    .interpolator(t => d3.interpolateRgb(
      d3.rgb(255, 215, 0),  // 黄色
      t < 0.5
        ? d3.rgb(255, 165, 0)  // 橙色
        : d3.rgb(238, 63,17)   // 红色
    )(t * 2));

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
    .attr("y", (d) => yScale(d.i))
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
        .html("Traffic Volume: " + d.value)
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
          ? "Predicted"
          : d === colordata[0].length - 1
          ? "Actual"
          : `${d}`
      )
      .tickSize(0);

    svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.margin.left}, ${
          dimensions.height - dimensions.margin.bottom
        })`
      )
      .call(xAxis)
      .select(".domain")
      .remove();

    const legend = svg
      .selectAll(".legend")
      .data(colorScale.ticks(6).slice(1).reverse())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        (d, i) => `translate(${10}, ${40 + i * 20})`
      );

    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", colorScale);

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
