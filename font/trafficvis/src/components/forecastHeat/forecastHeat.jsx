import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import "./forecastHeat.css";

const ForecastHeat = () => {
  const heatRef = useRef(null);

  useEffect(() => {
    drawHeat();
  }, []);
  const drawHeat = () => {
    const divHeight = heatRef.current.offsetHeight;
    const divWidth = heatRef.current.offsetWidth;

    const dimensions = {
      width: divWidth,
      height: divHeight,
      margin: {
        top: 30,
        right: 30,
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
    const rectGroup = bounds.append("g");
    rectGroup
      .append("rect")
      .attr("width", boundedWidth)
      .attr("height", boundedHeight)
      .attr("fill", "#fff");
    //绘制热力图
    const colorData = [
      [0.1, 0.2, 0.3, 0.7],
      [0.4, 0.5, 0.6, 0.1],
      [0.7, 0.8, 0.9, 0.2],
      [0.1, 0.2, 0.3, 0.7],
      [0.4, 0.5, 0.6, 0.1],
    ];
    const colorScale = d3
      .scaleQuantize()
      .domain([0, 1])
      .range(d3.schemeBlues[9]);
    const rectWidth = boundedWidth / 5;
    const rectHeight = boundedHeight / 4;
    const rectHeatGroup = bounds.append("g");
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        rectHeatGroup
          .append("rect")
          .attr("x", i * rectWidth)
          .attr("y", j * rectHeight)
          .attr("width", rectWidth)
          .attr("height", rectHeight)
          .attr("fill", colorScale(colorData[i][j]))
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .style("opacity", 0.8);
      }
    }
    //绘制健康度折线图
    const xScale = d3.scaleLinear().domain([0, 300]).range([0, boundedWidth]);
    const yScale = d3.scaleLinear().domain([0, 4]).range([boundedHeight, 0]);

    const tickArray = [0,60,120,180,240,300]
    const xAxis = d3.axisBottom(xScale).tickValues(tickArray);;
    rectGroup
      .append("g")
      .attr("class", "xAixs")
      .call(xAxis)
      .attr("transform", `translate(0,${boundedHeight})`)
      ;
      bounds
      .append("g")
      .attr("calss", "text-labels")
      .selectAll("text")
      .data(Array.from({ length:4 }, (v, i) => i))
      .enter()
      .append("text")
      .attr("x", dimensions.margin.left - 60)
      .attr("y", (d) => yScale(d)+(yScale(1)-yScale(0))/3 )
      .attr("text-anchor", "end") // 设置文本对齐方式为右对齐
      .style("font-size", "12px") // 设置文本字体大小
      .text((d) => `road${d + 1}`);
  };

  return <div ref={heatRef} id="heat" className="container"></div>;
};

export default ForecastHeat;
