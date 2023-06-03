import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { getIdHighValue } from "../../apis/api";
import { LANE_ID_LIST } from "../utils/constant";
import { Table} from 'rsuite';
import "./singleTrace.css";
import InfoList from "../infoList/infoList";

const { Column, HeaderCell, Cell } = Table;

const SingleTrace = (props) => {
  const { isTraceVisible, selectTraceId, singleType } = props;
  const singleTraceRef = useRef(null);
  const barRef = useRef(null);
  useEffect(() => {
    if (isTraceVisible) {
      getIdHighValue(selectTraceId, singleType).then((res) => {
        const lanNumber = res["flowSe"].length;
        drawBar(res["hvCount"]);
        drawSingleTrace(
          res["hvPositionList"],
          lanNumber,
          res["vPositionList"],
          res["flowSe"],
          res["flowList"]
        );
      });
    }
  }, [isTraceVisible, selectTraceId, singleType]);

  const drawSingleTrace = (data, yNum, vdata, roadData, flowData) => {
    const divHeight = singleTraceRef.current.offsetWidth;
    const divWidth = singleTraceRef.current.offsetHeight;
    const dimensions = {
      width: divHeight,
      height: 315,
      margin: { top: 10, right: 20, bottom: 40, left: 50 },
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
    data.forEach((d) => {
      d.y += 0.5;
    });
    bounds
      .append("rect")
      .attr("id","containerRect")
      .attr("width", boundedWidth)
      .attr("height", boundedHeight)
      .style("fill", "#fff")
      .style("stroke", "black") // 设置描边颜色为黑色
      .style("stroke-width", "1px"); // 设置描边宽度为2像素
    /*******************************************坐标轴设置 */

    // 添加 x 轴以及设置x轴
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.x), d3.max(data, (d) => d.x)]) // 输入范围
      .range([0, boundedWidth]); // 输出范围

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5) // 根据你的需要设置刻度的数量
      .tickFormat((d) => {
        // 将时间戳转化为Date对象
        const date = new Date(d * 1000); // JavaScript的时间戳是以毫秒为单位的，因此需要乘以1000
        // 按“小时:分钟:秒”的方式格式化日期
        const format = d3.timeFormat("%H:%M:%S");
        return format(date);
      });

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
      .data(roadData)
      .enter()
      .append("text")
      .attr("x", dimensions.margin.left - 60)
      .attr("y", (d, i) => yScale(i) + (yScale(1) - yScale(0)) / 5)
      .attr("text-anchor", "end") // 设置文本对齐方式为右对齐
      .style("font-size", "12px") // 设置文本字体大小
      .text((d) => `road:${d}`);
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

    // 流量比例尺
    const colorScale = d3
      .scaleQuantize()
      .domain([0, d3.max(flowData, (d) => d)])
      .range(d3.schemeBlues[9]);
    // 一个车道持续5分钟的流量
    const rectHeight = boundedHeight / flowData.length;
    const rectGroup = bounds.append("g");

    for (let j = 0; j < flowData.length; j++) {
      rectGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", j * rectHeight)
        .attr("width", boundedWidth)
        .attr("height", rectHeight)
        .attr("fill", colorScale(flowData[flowData.length - 1 - j]))
        .attr("stroke", "none")
        .style("opacity", 0.5);
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
      if (i > 0) {
        const prev = data[i - 1];
        const timeDiff = Math.abs(current.nowTime - prev.nowTime);
        const isSameLocation = current.y === prev.y || current.x === prev.x;
        const isCarCrossType = current.type === "carCross";
        const shouldConnect =
          isSameLocation && !(isCarCrossType && timeDiff > 20);

        if (shouldConnect) {
          result[result.length - 1].push(current);
        } else {
          result.push([current]);
        }
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
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity]) // 设置缩放的最小和最大比例
      .translateExtent([
        [0, 0],
        [boundedWidth, boundedHeight],
      ]) // 设置平移的范围
      .extent([
        [0, 0],
        [boundedWidth, boundedHeight],
      ]) // 设置缩放的范围
      .on("zoom", zoomed); // 设置缩放事件的监听器

    svg.call(zoom); // 将zoom行为应用到svg元素上

    function zoomed(event) {
      const new_xScale = event.transform.rescaleX(xScale); // 根据缩放行为更新x轴的比例尺
      bounds.select(".x-axis").call(xAxis.scale(new_xScale)); // 使用新的比例尺更新x轴

      // 使用新的比例尺更新线和点
      lineGroup.selectAll("path").attr(
        "d",
        line.x((d) => new_xScale(d.x))
      );
      bounds.selectAll("circle").attr("cx", (d) => new_xScale(d.x));
    }
  };

  //绘制柱状图
  const drawBar = (data) => {
    // 获取div元素的高度和宽度
    const divHeight = barRef.current.offsetHeight;
    const divWidth = barRef.current.offsetWidth;
    const dimensions = {
      width: divWidth,
      height: 234,
      margin: { top: 10, right: 10, bottom: 50, left: 10 },
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
        <div className=".barBox">
          <div className="infoList"><InfoList></InfoList></div>
        <div className="bar" ref={barRef} id="bar"></div>
        </div>
        <div className="container" ref={singleTraceRef} id="singleTrace"></div>
</div>
  );
};
export default SingleTrace;
