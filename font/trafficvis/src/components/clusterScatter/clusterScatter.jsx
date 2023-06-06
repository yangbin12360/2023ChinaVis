import * as d3 from "d3";
import * as echarts from "echarts";
import { lasso } from "d3-lasso";
import React, { useEffect, useRef, useState } from "react";
import "./clusterScatter.css";
import { getCluster } from "../../apis/api";
import { CLUSTER_LABEL_LIST, CLUSTER_TYPE_LIST } from "../utils/constant";
const ClusterScatter = (props) => {
  const { timeStamp, handleClusterNum, handleSimCount,selectDir,handleAllCluster} = props;
  const clusterRef = useRef(null);
  const radarRef = useRef(null);
  const [allNum,setAllNum]=useState(0)
  const [flagCount,setFlagCount] = useState(0)

  useEffect(() => {
    getCluster(timeStamp).then((res) => {
      let clusterData = res["scatter"];
      // let radarData = res["radar"];
      drawCluster(clusterData);
      // handleAllCluster(clusterData)
      // drawRadar(radarData);
      handleClusterNum(res["count"]);
      handleSimCount(res["count"]);
      setAllNum(res["count"])
    });
  }, [timeStamp]);
  useEffect(()=>{
    setFlagCount(flagCount+1)
    if(flagCount>1){
      handleSimCount(allNum)
    }
  },[selectDir])
  const drawCluster = (clusterData) => {
    const divWidth = clusterRef.current.offsetWidth;
    const divHeight = clusterRef.current.offsetHeight;
    const dimensions = {
      width: divWidth,
      height: divHeight,
      margin: {
        top: 10,
        right: 20,
        bottom: 17,
        left: 23,
      },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height- dimensions.margin.top - dimensions.margin.bottom
      ;

    d3.select("#cluster svg").remove();
    const svg = d3
      .select("#cluster")
      .append("svg")
      .attr("width", dimensions.width )
      .attr("height", dimensions.height )
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .style("max-width", "100%")
      .style("background", "#efefef");
    const bounds = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.margin.left},${dimensions.margin.top})`
      );

    const colorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2])
      .range(CLUSTER_LABEL_LIST);
    const typeScale = d3
      .scaleOrdinal()
      .domain([1, 4, 6])
      .range(CLUSTER_TYPE_LIST);
    const xMax = Math.max(
      Math.abs(d3.min(clusterData, (d) => d.position.x)),
      Math.abs(d3.max(clusterData, (d) => d.position.x))
    );
    const yMax = Math.max(
      Math.abs(d3.min(clusterData, (d) => d.position.y)),
      Math.abs(d3.max(clusterData, (d) => d.position.y))
    );
    const xScale = d3
      .scaleLinear()
      .domain([-xMax, xMax])
      .range([0, boundedWidth]);
    const yScale = d3
      .scaleLinear()
      .domain([yMax, -yMax]) // inverted domain because SVG y coordinates start from the top
      .range([0, boundedHeight]);
    // const xScale = d3
    //   .scaleLinear()
    //   .domain([d3.min(clusterData, (d) =>d.position.x), d3.max(clusterData, (d) =>d.position.x)])
    //   .range([0, boundedWidth]);

    // const yScale = d3
    //   .scaleLinear()
    //   .domain([d3.min(clusterData, (d) => d.position.y), d3.max(clusterData, (d) => d.position.y)])
    //   .range([boundedHeight, 0]);

    const xAxis = d3.axisBottom(xScale).ticks(5);
    bounds
      .append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(0,${boundedHeight})`)
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale).ticks(5);
    bounds.append("g").attr("class", "yAxis").call(yAxis);
    // 创建一个tooltip div在body中
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // 更新circle的定义
    const circleGroup = bounds
      .selectAll("circle")
      .data(clusterData)
      .enter()
      .append("circle")
      .attr("id", (d) => d.id)
      .attr("cx", (d) => xScale(d.position.x))
      .attr("cy", (d) => yScale(d.position.y))
      .attr("r", 6) // 设置圆点半径
      .style("fill", (d) => colorScale(d.cluster))
      .attr("stroke", (d) => typeScale(d.type)) // 设置圆点边框颜色
      .attr("stroke-width", 1)
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html("ID: " + d.id + "\nType:" + d.type);

        var svgContainer = d3.select("#cluster").node();
        var xOffset =
          window.scrollX +
          svgContainer.getBoundingClientRect().left +
          d3.pointer(event, svgContainer)[0] +
          10;
        var yOffset =
          window.scrollY +
          svgContainer.getBoundingClientRect().top +
          d3.pointer(event, svgContainer)[1] +
          10;

        tooltip.style("left", xOffset + "px").style("top", yOffset + "px");
      })
      .on("mouseout", function (d) {
        // 添加鼠标移出事件
        tooltip.transition().duration(500).style("opacity", 0);
      });
    // 创建zoom行为
    // 创建zoom行为
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5]) // 缩放的最小和最大比例
      .on("zoom", function (event) {
        // 获取缩放和平移变换
        const transform = event.transform;

        // 创建新的缩放后的比例尺
        var updatedXScale = transform.rescaleX(xScale);
        var updatedYScale = transform.rescaleY(yScale);

        // 更新坐标轴
        bounds.select(".xAxis").call(xAxis.scale(updatedXScale));
        bounds.select(".yAxis").call(yAxis.scale(updatedYScale));

        // 更新数据点的位置
        circleGroup
          .attr("cx", (d) => updatedXScale(d.position.x))
          .attr("cy", (d) => updatedYScale(d.position.y));
      });

    // 将zoom行为应用到svg上
    svg.call(zoom);

    // 设置圆点边框大小
    // 设置填充颜色
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
        return [parseInt(item.getAttribute("id")), item.__data__];
      });
      console.log("selected: ", selectedData);
      selectClusterData(selectedData);
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
    svg.call(my_lasso);
  };
  const selectClusterData = (clusterData) => {
    let clusterId = [];
    let clusterCount = [0, 0, 0];
    clusterData.forEach((item) => {
      clusterId.push(item[0]);
      if (item[1].cluster === 0) {
        clusterCount[0] += 1;
      } else if (item[1].cluster === 1) {
        clusterCount[1] += 1;
      } else {
        clusterCount[2] += 1;
      }
    });
    handleAllCluster(clusterId);
    handleSimCount(clusterCount);
  };
  
  return (
    <div className="container">
      <div className="cluster" ref={clusterRef} id="cluster"></div>
    </div>
  );
};

export default ClusterScatter;
