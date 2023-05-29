import * as d3 from "d3";
import * as echarts from "echarts";
import { lasso } from "d3-lasso";
import React, { useEffect, useRef } from "react";
import "./clusterScatter.css";

const ClusterScatter = () => {
  const clusterRef = useRef(null);
  const radarRef = useRef(null);

  // 数据
  const data = [
    { x: 10, y: 20 },
    { x: 40, y: 90 },
    { x: 80, y: 50 },
    { x: 50, y: 30 },
  ];

  useEffect(() => {
    drawCluster();
    drawRadar()
  }, []);

  const drawCluster = () => {

    const divWidth = clusterRef.current.offsetWidth;
    const divHeight = clusterRef.current.offsetHeight;
    const dimensions = {
      width: divWidth,
      height: divHeight,
      margin: {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20,
      },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.select("#cluster svg").remove();

    const svg = d3
      .select("#cluster")
      .append("svg")
      .attr("width", dimensions.width - 10)
      .attr("height", dimensions.height - 10)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .style("max-width", "100%")
      .style("background", "#fff");
    const bounds = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.margin.left},${dimensions.margin.top})`
      );

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x)])
      .range([0, boundedWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)])
      .range([boundedHeight, 0]);
    const xAxis = d3.axisBottom(xScale).ticks(5);
    bounds
      .append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(0,${boundedHeight})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    bounds.append("g").attr("class", "yAxis").call(yAxis);
    const circleGroup = bounds.append("g");
    circleGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5) // 设置圆点半径
      .style("fill", "steelblue"); // 设置填充颜色
    /**套索工具实现 */
    // ----------------   LASSO STUFF . ----------------
    const lasso_start = () => {
      my_lasso
        .items()
        // .attr("r", 7)
        .classed("not_possible", true)
        .classed("selected", false);
    };

    const lasso_draw = () => {
      my_lasso
        .possibleItems()
        .classed("not_possible", false)
        .classed("possible", true);
      my_lasso
        .notPossibleItems()
        .classed("not_possible", true)
        .classed("possible", false);
    };

    const lasso_end = () => {
      my_lasso
        .items()
        .classed("not_possible", false)
        .classed("possible", false);
      my_lasso.selectedItems().classed("selected", true);
      let selectedData = my_lasso.selectedItems()._groups[0].map((item) => {
        console.log(item);
        return [parseInt(item.getAttribute("id")), item.__data__];
      });
      // console.log("selected: ", selectedData);
      // .attr("r", 7);
    };

    const my_lasso = lasso()
      .closePathDistance(305)
      .closePathSelect(true)
      .targetArea(bounds)
      .items(circleGroup)
      .on("start", lasso_start)
      .on("draw", lasso_draw)
      .on("end", lasso_end);
    bounds.call(my_lasso)
  };

  const drawRadar = ()=>{
    let existInstance = echarts.getInstanceByDom(radarRef.current);
    if (existInstance !== undefined) {
      echarts.dispose(existInstance);
    }
    const radarChart = echarts.init(radarRef.current);
    const option = {
      legend: {
        data: ['cluster1', 'cluster2','cluster3'],
        textStyle: {
          fontSize: 10  // 将图例字体大小设置为20
        }
      },
      radar: {
        radius: '70%',
        shape: 'circle',
        indicator: [
          { name: 'Sales', max: 6500 },
          { name: 'Administration', max: 16000 },
          { name: 'Information Technology', max: 30000 },
          { name: 'Customer Support', max: 38000 },
        ]
      },
      series: [
        {
          name: 'Budget vs spending',
          type: 'radar',
          data: [
            {
              value: [4200, 3000, 20000, 35000, 50000, 18000],
              name: 'cluster1'
            },
            {
              value: [5000, 14000, 28000, 26000, 42000, 21000],
              name: 'cluster2'
            },
            {
              value: [1000, 14000, 28000, 26000, 42000, 21000],
              name: 'cluster3'
            }
          ]
        }
      ]
    };
    radarChart.setOption(option);
    window.onresize = radarChart.resize;
  }
  return (
    <div className="container">
      <div className="cluster" ref={clusterRef} id="cluster"></div>
      <div className="radar" ref={radarRef}>2</div>
    </div>
  );
};

export default ClusterScatter;