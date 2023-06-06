import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./sceneList.css";
import { getHighValue } from "../../apis/api";
import { HV_NAME_LIST,HV_NAME_LIST_CN, HV_NAME_EASY_LIST,TYPE_NAME_LIST } from "../utils/constant";

const SceneList = (props) => {
  const { timeStamp,isTraceVisible, selectTraceId,handleSelectTraceId } = props;
  // sceneBar长度和宽度
  const sceneBarRef = useRef(null);
  const detailRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isListVisible, setListVisible] = useState(false); // 新的状态来控制列表的显示/隐藏
  const [hvData, setHvData] = useState([]); //高价值场景数据
  const [barData, setBarData] = useState([]); //柱状图数据
  const [detailScene, setDetailScene] = useState([]); //详情数据

  //对高价值场景列表利用hvData进行渲染
  useEffect(() => {
    getHighValue(timeStamp).then((res) => {
      const data = res;
      let tempArray = [];
      let barArray = [];
      let index = 0;
      HV_NAME_LIST.forEach((item, itemIndex) => {
        let typeCount = 0;
        let tempDict = {};
        data[item].forEach((d, i) => {
          d["start_time"] = converTimestamp(d["start_time"]);
          d["index"] = index;
          index++;
          tempArray.push(d);
          typeCount++;
        });
        tempDict["sceneType"] = HV_NAME_EASY_LIST[itemIndex];
        tempDict["count"] = typeCount;
        barArray.push(tempDict);
      });
      if (barArray.length > 0) {
        setBarData(barArray);
        drawSceneBar(barArray);
      }
      if (tempArray.length > 0) {
        setHvData(tempArray);
      }
    });
  }, [timeStamp]);

  //绘制柱状图
  const drawSceneBar = (data) => {
    // 获取div元素的高度和宽度
    const divHeight = sceneBarRef.current.offsetWidth;
    const divWidth = sceneBarRef.current.offsetHeight;
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
      .attr("width", dimensions.width-10)
      .attr("height", dimensions.height-10)
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
      .attr("height", (d) => yScale(d.count))
      .attr('fill','#86bbd8');

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
      .attr("y", boundedHeight+20)
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
    .attr("y", (d) =>boundedHeight-yScale(d.count)-10 )
    .attr("transform", `translate(${xScale.bandwidth() / 4},0)`);
  };

  // 新的函数来切换列表的显示/隐藏状态，并且重置选中的行
  const toggleListVisibility = () => {
    const selectedData = hvData.filter((row) => selectedRows.includes(row.id));
    console.log("selectedData", selectedData);
    console.log("detailRef", detailRef.current);
    if (detailRef.current == null) {
      setListVisible(!isListVisible); // 清空选中的行
    }
    handleSelectTraceId(selectedData[0]["id"],selectedData[0]["type"])
    setSelectedRows([]);
  };

  const toggleRowSelection = (id) => {
    if (selectedRows.length === 0) {
     setSelectedRows([id]); // 如果当前没有选中行，则选中当前行
    } else {
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.includes(id) ? [] : [id] // 如果当前行已经选中，则取消选中，否则选中当前行并取消其他行的选中状态
      );
    }
  };
  //16位时间戳转换
  const converTimestamp = (timestamp) => {
    // 将微秒时间戳转换为毫秒
    const milliseconds = timestamp / 1000;
    // 使用毫秒时间戳创建一个新的 Date 对象
    const date = new Date(milliseconds);
    // 获取小时、分钟和秒
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    // 返回格式化的时间字符串
    return `${hours}:${minutes}:${seconds}`;
  };
  return (
    <div className="container">
      <div className="topBox">
        <div className="numChart" ref={sceneBarRef} id="sceneBar"></div>
        <div className="line"></div>
        <div className="sceneList">
          <div className="tableContainer">
            <table>
              <thead className="tableH">
                <tr className="thr">
                  <th className="thone">
                    <div onClick={toggleListVisibility}>生成</div>
                  </th>
                  <th>Id</th>
                  <th>类型</th>
                  <th>高价值场景类型</th>
                  <th>开始时间</th>
                </tr>
              </thead>
              <tbody className="tableB">
                {hvData.map((row) => (
                  <tr
                    key={row.index}
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
                    <td>{TYPE_NAME_LIST[row.type]}</td>
                    <td>{HV_NAME_LIST_CN[row.hv_type]}</td>
                    <td>{row.start_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mid"></div>
    </div>
  );
};

export default SceneList;
