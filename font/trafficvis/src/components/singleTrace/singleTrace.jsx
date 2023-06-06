import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { getIdHighValue } from "../../apis/api";
import { LANE_ID_LIST ,HV_NAME_LIST_CN_V2,HV_NAME_LIST_CN_COLOR } from "../utils/constant";
import { Table } from "rsuite";
import "./singleTrace.css";
import InfoList from "../infoList/infoList";

const { Column, HeaderCell, Cell } = Table;

const SingleTrace = (props) => {
  const { isTraceVisible, selectTraceId, singleType,handleChangeTime,handleSelectId  } = props;
  const singleTraceRef = useRef(null);
  const barRef = useRef(null);
  const legendRef = useRef(null);
  const changeNowTime =(timeStamp)=>{
    handleChangeTime(timeStamp);
  }
  useEffect(() => {
    if (isTraceVisible) {
      getIdHighValue(selectTraceId, singleType).then((res) => {
        const lanNumber = res["flowSe"].length;
        // drawBar(res["hvCount"]);
        drawSingleTrace(
          res["hvPositionList"],
          lanNumber,
          res["vPositionList"],
          res["flowSe"],
          res["flowList"]
        );
        // drawTest()
      });
    }
  }, [isTraceVisible, selectTraceId, singleType]);
const drawSingleTrace = (data, yNum, vdata, roadData, flowData) => {
    const divHeight = singleTraceRef.current.offsetWidth;
    const divWidth = singleTraceRef.current.offsetHeight;
    // const divHeight = 100

    const dimensions = {
      width: divHeight,
      height: divWidth ,
      margin: { top: 10, right: 30, bottom: 30, left: 50 },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.selectAll("div#singleTrace svg").remove();
    const svg = d3
      .select("#singleTrace")
      .append("svg")
      .attr("width", divHeight)
      .attr("height", divWidth)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .style("max-width", "100%")
      .style("background", "#efefef")

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
      .attr("id", "containerRect")
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
    // const colorScale = d3
    //   .scaleQuantize()
    //   .domain([0,d3.max(flowData, (d) => d)])
    //   .range(["#b7d4af","#a2cbbf","#1b7c9d"]);
    let colorScale = d3.scaleSequential([0,d3.max(flowData, (d) => d)], d3.interpolateGnBu);
    // 一个车道持续5分钟的流量
    const rectHeight = boundedHeight / flowData.length;
    const rectGroup = bounds.append("g");
    const textGroup = bounds.append("g");
    console.log("flowData",flowData);
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
        // textGroup
        // .append("text")
        // .attr("x", boundedWidth/2)
        // .attr("y", (j * rectHeight) + rectHeight / 2+5)
        // .attr("text-anchor", "middle") // 设置文本对齐方式
        // .style("font-size", "12px") // 设置文本字体大小
        // .text(`车流量：${flowData[flowData.length - 1 - j]}`)
        // .attr("fill", "black")
        // .attr("opacity", 0.6)
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
        .attr("stroke", "#6c757d")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("stroke-linejoin", "round")
        .attr("d", line);
      
    });

    // 画点
let tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);
    // 画点
    bounds
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4) // 设置点的大小
      .attr("fill", (d,i)=>{
        return HV_NAME_LIST_CN_COLOR[d.type] 
      })
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
        .transition()
        .duration(50)
        .attr("r", 4 * 1.5)
          .attr("fill", "white"); // 改变高亮颜色
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("时间: " + converTimestamp(d.nowTime) + "<br/>" + "事件类型: " + HV_NAME_LIST_CN_V2[d.type]) 
          .style("left", (event.pageX-250) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
        .transition()
        .duration(50)
        .attr("r", 5 )
          .attr("fill", d=>HV_NAME_LIST_CN_COLOR[d.type] ); // 恢复原颜色
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click",(e)=>{
        // changeNowTime(d.nowTime)
        let clickedElement =e.currentTarget;
        let boundData = d3.select(clickedElement).datum();
        changeNowTime(boundData.nowTime)
        handleSelectId(selectTraceId,singleType)
      })
      
      ;
       // 设置点的颜色
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
//16位时间戳转换
const converTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


  return (
    <div className="box">
        <div className="infoList">
          <InfoList
            selectTraceId={selectTraceId}
            singleType={singleType}
          ></InfoList>
        </div>
        {/* <div className="bar" ref={barRef} id="bar"></div> */}
        <div className="picBox" ref={singleTraceRef} id="singleTrace"></div>
    </div>
  );
};
export default SingleTrace;
