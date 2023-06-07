import { Table } from "rsuite";
import { Space, Tag } from "antd";
import * as d3 from "d3";
import React, { useState, useEffect, useRef } from "react";
import { TYPE_NAME_LIST,CIRCLE_LEGEND_CORLORS,HV_NAME_LEGEND_LIST } from "../utils/constant.js";

const { Column, HeaderCell, Cell } = Table;

const InfoList = (props) => {
  const { selectTraceId, singleType } = props;
  const [infoArray, setInfoArray] = useState([]);
  const svgRef = useRef(null);
  const circleRef = useRef(null);
  useEffect(() => {
    setInfoArray([{ id: selectTraceId, type: TYPE_NAME_LIST[singleType] }]);

    // infoArray.push({id:selectTraceId,type:singleType})
  }, [selectTraceId, singleType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (svgRef.current) {
        drawLegend();
        drawCircleLegend()
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const drawLegend = () => {
    if (!svgRef.current) {
      return;
    }
    const divWidth = svgRef.current.offsetWidth;
    const divHeight = svgRef.current.offsetHeight;
    const svg = d3
      .select("#legend")
      .append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight)
      .style("background", "#efefef");
    //绘制轨迹图例
    const traceLine = svg.append("g").attr("transform", "translate(0,0)");
    traceLine
      .append("line")
      .attr("x1", 0)
      .attr("y1", 26)
      .attr("x2", 40)
      .attr("y2", 26)
      .attr("stroke", "black")
      .attr("stroke-width", 2);
    traceLine.append("text").attr("x", 50).attr("y", 30).text("轨迹");
    //绘制速度折线图例
    const vLine = svg.append("g");
    const sineWave = d3
      .line()
      .x((d, i) => i * 2 + 10)
      .y((d) => 20 + 2 * Math.sin(d * 4)) // change the multiple of d in y() and the multiple of i in x()
      .curve(d3.curveCardinal);
    let data = d3.range(0, Math.PI, Math.PI / 16);
    vLine
      .append("path")
      .attr("d", sineWave(data))
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("transform", "translate(100,6)");
    vLine.append("text").attr("x", 165).attr("y", 30).text("速度");
    //绘制流量背景色块

    const flowRect = svg.append("g").attr("transform", "translate(,0)");
    let gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.interpolateGnBu(0))
      .attr("stop-opacity", 1);
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.interpolateGnBu(1))
      .attr("stop-opacity", 1);
    flowRect
      .append("rect")
      .attr("x", 220)
      .attr("y", 16)
      .attr("width", 50)
      .attr("height", 20)
      .style("fill", "url(#gradient)");
    flowRect.append("text").attr("x", 280).attr("y", 30).text("车流量");
  };

  const drawCircleLegend = () => {
    if (!circleRef.current) {
      return;
    }
    const divWidth = circleRef.current.offsetWidth;
    const divHeight = circleRef.current.offsetHeight;

    const svg = d3
      .select("#circleLegend")
      .append("svg")
      .attr("width", divWidth)
      .attr("height", divHeight)
      .style("background", "#efefef");


    const circles = svg
      .selectAll("circle")
      .data(CIRCLE_LEGEND_CORLORS)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => (i % 4) * 100 + 60) 
      .attr("cy", (d, i) => Math.floor(i / 4) * 15+20 ) 
      .attr("r", 5) 
      .style("fill", (d) => d)
      .style("stroke", "black")
      .style("stroke-width", 1)

    const texts = svg
      .selectAll("text")
      .data(HV_NAME_LEGEND_LIST)
      .enter()
      .append("text")
      .attr("x", (d, i) => (i % 4) * 100 + 70)
      .attr("y", (d, i) => Math.floor(i / 4) *15+25 ) 
      .style("font-family", "Open Sans")
      .style("fill", "#333333")
      .text((d) => d)
      
  };
  return (
    <div className="infoBox">
      <Table height={85} data={infoArray} headerHeight={35}>
        <Column width={100} align="center" fixed>
          <HeaderCell
            style={{
              fontWeight: "bold",
              backgroundColor: "#efefef",
              borderBottom: "2px solid #fff",
            }}
          >
            ID
          </HeaderCell>
          <Cell dataKey="id" style={{ backgroundColor: "#efefef" }} />
        </Column>
        <Column width={80} align="center" fixed>
          <HeaderCell
            style={{
              fontWeight: "bold",
              backgroundColor: "#efefef",
              borderBottom: "2px solid #fff",
            }}
          >
            类型
          </HeaderCell>
          <Cell dataKey="type" style={{ backgroundColor: "#efefef" }}></Cell>
        </Column>
        <Column width={500} align="center" fixed>
          <HeaderCell
            style={{
              fontWeight: "bold",
              backgroundColor: "#efefef",
              borderBottom: "2px solid #fff",
            }}
          >
            事件类型标签
          </HeaderCell>
          <Cell style={{ backgroundColor: "#efefef", padding: 0 }}>
            <div
              id="circleLegend"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#efefef",
              }}
              ref={circleRef}
            >
      
            </div>
          </Cell>
        </Column>
        <Column width={380} align="center" fixed>
          <HeaderCell
            style={{
              fontWeight: "bold",
              backgroundColor: "#efefef",
              borderBottom: "2px solid #fff",
            }}
          >
            图例
          </HeaderCell>
          <Cell style={{ padding: 0 }}>
            <div
              id="legend"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#efefef",
              }}
              ref={svgRef}
            ></div>
          </Cell>
        </Column>
      </Table>
    </div>
  );
};

export default InfoList;
