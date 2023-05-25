import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./sceneList.css";

const SceneList = () => {
  // sceneBar长度和宽度
  const sceneBarRef = useRef(null);
  const detailRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isListVisible, setListVisible] = useState(false); // 新的状态来控制列表的显示/隐藏

  //临时假数据
  const data = Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    type: `type${i + 1}`,
    highValueScene: `scene${i + 1}`,
    startTime: "2023-05-24",
  }));
  const tempData = [
    {
      sceneType: "a",
      count: 10,
    },
    {
      sceneType: "b",
      count: 18,
    },
    {
      sceneType: "c",
      count: 40,
    },
    {
      sceneType: "d",
      count: 110,
    },
    {
      sceneType: "e",
      count: 54,
    },
    {
      sceneType: "f",
      count: 21,
    },
    {
      sceneType: "g",
      count: 12,
    },
    {
      sceneType: "h",
      count: 154,
    },
    {
      sceneType: "i",
      count: 143,
    },
  ];
  //绘制柱状图
  const drawSceneBar = () => {
    // 获取div元素的高度和宽度
    const divHeight = sceneBarRef.current.offsetWidth;
    const divWidth = sceneBarRef.current.offsetHeight;
    console.log(divHeight, divWidth);
    const dimensions = {
      width: divHeight,
      height: divWidth,
      margin: { top: 10, right: 10, bottom: 30, left: 10 },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    d3.selectAll("div#sceneBar svg").remove();

    const svg = d3
      .select("#sceneBar")
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
      .domain(d3.range(tempData.length))
      .range([0, boundedWidth])
      .padding(0.05);
    let yScale = d3
      .scaleLinear()
      .domain([0, d3.max(tempData, (d) => d.count)])
      .range([0, boundedHeight - dimensions.margin.bottom]);

    //绘制柱状图背景
    bounds
      .append("g")
      .selectAll("rect")
      .data(tempData)
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
      .data(tempData)
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
      .data(tempData)
      .join("text")
      .text((d) => d.sceneType)
      .attr("x", (d, i) => {
        return xScale(i);
      })
      .attr("y", dimensions.margin.top + d3.max(tempData, (d) => d.count) + 10)
      .attr("transform", `translate(${xScale.bandwidth() / 2},0)`);
  };

// 新的函数来切换列表的显示/隐藏状态，并且重置选中的行
  const toggleListVisibility = () => {
    const selectedData = data.filter(row => selectedRows.includes(row.id));
    console.log("selectedData",selectedData);
    console.log("detailRef",detailRef.current);
    if(detailRef.current ==null){
    setListVisible(!isListVisible); // 清空选中的行
    }
    setSelectedRows([]);
  };

  useEffect(() => {
    drawSceneBar();
  }, []);
  const toggleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  return (
    <div className="container">
      <div className="topBox">
        <div className="numChart" ref={sceneBarRef} id="sceneBar"></div>
        <div className="sceneList">
          <div className="tableContainer">
            <table>
              <thead className="tableH">
                <tr className="thr">
                  <th className="thone">
                    <div onClick={toggleListVisibility}>生成</div>
                  </th>
                  <th>id</th>
                  <th>type</th>
                  <th>高价值场景类型</th>
                  <th>开始时间</th>
                </tr>
              </thead>
              <tbody className="tableB">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    style={
                      selectedRows.includes(row.id)
                        ? { background: "yellow" }
                        : {}
                    }
                  >
                    <td className="thone">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </td>
                    <td className="cText">{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.highValueScene}</td>
                    <td>{row.startTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mid"></div>
      <div className="bottomBox">
        <div className="sceneDetail">4</div>
        <div className="sceneList">
         {isListVisible&&( <div className="tableContainer" ref={detailRef}>
            <table>
              <thead className="tableH">
                <tr className="thr">
                  <th className="thone"></th>
                  <th>id</th>
                  <th>type</th>
                  <th>高价值场景类型</th>
                  <th>开始时间</th>
                </tr>
              </thead>
              <tbody className="tableB">
                {data.map((row) => (
                  <tr
                    key={row.id}
                    style={
                      selectedRows.includes(row.id)
                        ? { background: "yellow" }
                        : {}
                    }
                  >
                    <td className="thone">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </td>
                    <td className="cText">{row.id}</td>
                    <td>{row.type}</td>
                    <td>{row.highValueScene}</td>
                    <td>{row.startTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>)}
        </div>
      </div>
      <div className="mid"></div>
    </div>
  );
};

export default SceneList;
