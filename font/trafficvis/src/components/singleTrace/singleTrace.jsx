import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import "./singleTrace.css";

const VData = [
  { x: 0, y: 5 },
  { x: 1, y: 9 },
  { x: 2, y: 7 },
  { x: 3, y: 5 },
  { x: 4, y: 3 },
  { x: 20, y: 8 },
];
const barData = [
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
  {
    sceneType: "CC",
    count: 146,
  },
];
const colorData = [0.05, 0.1, 0.15, 0.2, 0.3, 0.25, 0.35, 0.45, 0.5];
const SingleTrace = (props) => {
  const {isTraceVisible, selectTraceId}=props
  const singleTraceRef = useRef(null);
  const barRef = useRef(null);
  useEffect(() => {
    if(isTraceVisible){
    let data = generateData();
    drawSingleTrace(data, 15, VData);
    drawBar(barData);}
  }, [isTraceVisible, selectTraceId]);

  function generateData() {
    let data = [];
    for (let i = 1; i <= 2; i++) {
      // 生成0到90之间的随机整数
      data.push({ x: i, y: 0.5 });
    }
    data.push({ x: 55, y: 0.5 });
    data.push({ x: 65, y: 1.5 });
    data.push({ x: 68, y: 1.5 });
    data.push({ x: 70, y: 0.5 });
    data.push({ x: 100, y: 0.5 });

    return data;
  }
  const drawSingleTrace = (data, yNum, vdata) => {
    const divHeight = singleTraceRef.current.offsetWidth;
    const divWidth = singleTraceRef.current.offsetHeight;
    const dimensions = {
      width: divHeight,
      height: divWidth,
      margin: { top: 10, right: 20, bottom: 30, left: 50 },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.selectAll("div#singleTrace svg").remove();
    const svg = d3
      .select("#singleTrace")
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

    bounds
      .append("rect")
      .attr("width", boundedWidth)
      .attr("height", boundedHeight)
      .style("fill", "#fff")
      .style("stroke", "black") // 设置描边颜色为黑色
      .style("stroke-width", "1px"); // 设置描边宽度为2像素
    /*******************************************坐标轴设置 */
    // 添加 x 轴以及设置x轴
    const xScale = d3
      .scaleLinear()
      .domain([0, 180]) // 输入范围
      .range([0, boundedWidth]); // 输出范围
    const customTicks = [0, 60, 120, 180];
    const xAxis = d3.axisBottom(xScale).tickValues(customTicks); // 设置刻度的数量
    bounds
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${boundedHeight})`)
      .call(xAxis);
    // 添加y轴以及设置y轴
    const tickDistance = boundedHeight / (yNum - 1);
    const yScale = d3.scaleLinear().domain([0, yNum]).range([boundedHeight, 0]); // 输出范围
    const yAxis = d3.axisLeft(yScale).ticks(yNum);
    bounds
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .call((g) => g.select(".domain").remove()) // 移除y轴的轴线
      .call((g) => g.selectAll(".tick line").attr("x2", boundedWidth)); // 设置刻度线的长度;
    bounds
      .select(".y-axis")
      .selectAll(".tick text")
      .style("visibility", "hidden");
    //添加y轴文本元素
    bounds
      .append("g")
      .attr("calss", "text-labels")
      .selectAll("text")
      .data(Array.from({ length: yNum }, (v, i) => i))
      .enter()
      .append("text")
      .attr("x", dimensions.margin.left - 60)
      .attr("y", (d) => yScale(d) + (yScale(1) - yScale(0)) / 5)
      .attr("text-anchor", "end") // 设置文本对齐方式为右对齐
      .style("font-size", "12px") // 设置文本字体大小
      .text((d) => `road${d + 1}`);
    //添加vy轴以及设置vy轴
    const yVelocityScale = d3
      .scaleLinear()
      .domain([0, d3.max(vdata, (d) => d.y)])
      .range([boundedHeight, 0]); // 输出范围
    const vYAxis = d3.axisRight(yVelocityScale).ticks(5);
    bounds
      .append("g")
      .attr("class", "v-y-axis")
      .attr("transform", `translate(${boundedWidth}, 0)`)
      .call(vYAxis)
      .call((g) => g.selectAll(".v-y-axis .tick line").remove()); // 移除vY轴的轴线

    const colorScale = d3
      .scaleQuantize()
      .domain([0, 1])
      .range(d3.schemeBlues[9]);
    const rectWidth = boundedWidth / 3;
    const rectHeight = boundedHeight / 9;
    const rectGroup = bounds.append("g");
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 9; j++) {
        rectGroup
          .append("rect")
          .attr("x", i * rectWidth)
          .attr("y", j * rectHeight)
          .attr("width", rectWidth)
          .attr("height", rectHeight)
          .attr("fill", colorScale(colorData[j]))
          .attr("stroke", "none")
          .style("opacity", 0.5);
      }
    }

    /*******************************************绘制线、点 */
    // 创建连接线
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));
    const vLine = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yVelocityScale(d.y));
    const vLineGroup = bounds.append("g");
    vLineGroup
      .append("path")
      .datum(vdata)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", vLine);
    // 创建连接点的数组
    const segments = data.reduce((result, current, i) => {
      console.log(result, current, i);
      if (i > 0 && current.y === data[i - 1].y) {
        result[result.length - 1].push(current);
      } else {
        result.push([current]);
      }
      return result;
    }, []);
    const lineGroup = bounds.append("g");
    // 画线
    segments.forEach((segment) => {
      lineGroup
        .append("path")
        .datum(segment)
        .attr("fill", "none")
        .attr("stroke", "blue") // 你可以选择你喜欢的颜色
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    // 画点
    bounds
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 2) // 设置点的大小
      .attr("fill", "red"); // 设置点的颜色
  };

  //绘制柱状图
  const drawBar = (data) => {
    // 获取div元素的高度和宽度
    const divHeight = barRef.current.offsetWidth;
    const divWidth = barRef.current.offsetHeight;
    const dimensions = {
      width: divHeight,
      height: divWidth,
      margin: { top: 10, right: 10, bottom: 30, left: 10 },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.selectAll("div#bar svg").remove();

    const svg = d3
      .select("#bar")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("videBox", [0, 0, dimensions.width, dimensions.height])
      .style("max-width", "100%")
      .style("background", "#fff");

    const bounds = svg
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    let xScale = d3
      .scaleBand()
      .domain(d3.range(data.length))
      .range([0, boundedWidth])
      .padding(0.05);
    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .range([0, boundedHeight - dimensions.margin.bottom]);

    //绘制柱状图背景
    bounds
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => {
        return xScale(i);
      })
      .attr("y", 0)
      .attr("width", xScale.bandwidth())
      .attr("height", boundedHeight)
      .attr("fill", "#eeeeee");

    // 绘制柱状图
    bounds
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d, i) => {
        return xScale(i);
      })
      .attr("y", (d) => boundedHeight - yScale(d.count))
      .attr("width", xScale.bandwidth() - 1)
      .attr("height", (d) => yScale(d.count));

    //绘制状图x轴名称
    bounds
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => d.sceneType)
      .attr("x", (d, i) => {
        return xScale(i);
      })
      .attr("y", boundedHeight + 20)
      .attr("transform", `translate(${xScale.bandwidth() / 4},0)`);
    //添加数量文字
    bounds
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => d.count)
      .attr("x", (d, i) => {
        return xScale(i);
      })
      .attr("y", (d) => boundedHeight - yScale(d.count) - 10)
      .attr("transform", `translate(${xScale.bandwidth() / 4},0)`);
  };
  return (
    <div className="box">
      <div className="bar" ref={barRef} id="bar"></div>
      <div className="container" ref={singleTraceRef} id="singleTrace"></div>
    </div>
  );
};
export default SingleTrace;
