import React, { useEffect, useRef, useState } from "react";
import { Radio } from "antd";
import * as echarts from "echarts";

import { getGroupLinesCluster, getGroupLinesSensor } from "../../apis/api";
import "./relationShip.less";

const GroupLines = (props) => {
  // const {
  //   lineGroupType,
  //   clusterLabel,
  //   groupLineList,
  //   setRangeBarPollutantIdx,
  //   setRangeBarTimeStampIdx,
  // } = props;
  // // console.log("clusterLabel", clusterLabel);
  const groupLinesRef = useRef(null);
  const [isZoomForAll, setIsZoomForAll] = useState("unify");
  const dataZoom = useRef(null);

  // useEffect(() => {
  //   if (groupLinesRef.current != null && clusterLabel.length !== 0) {
  //     if (lineGroupType === "sensor") {
  //       getGroupLinesSensor().then((res) => {
  //         initSensorGraph(res);
  //       });
  //     } else if (lineGroupType === "cluster") {
  //       getGroupLinesCluster(clusterLabel, groupLineList).then((res) => {
  //         initClusterGraph(res);
  //       });
  //     }
  //   }
  // }, [lineGroupType, groupLineList, isZoomForAll, clusterLabel]);
  var dataset = [];
  useEffect(()=>{
    initClusterGraph(dataset);

  },[])

  const initSensorGraph = (res) => {
    if (groupLinesRef.current === null) return;
    let { data, label, times } = res;

    let idxes = groupLineList.map((item) => POLLUTANTLIST_NAME.indexOf(item));

    if (groupLineList.length !== 0) {
      data = idxes.map((item) => data[item]);
      label = idxes.map((item) => label[item]);
    } else {
      data = data.slice(0, 3);
      label = label.slice(0, 3);
    }

    const title = [];
    const xAxis = [];
    const yAxis = [];
    const series = [];
    const grid = [];
    const chartHeight = 90;
    groupLinesRef.current.style.height = `${
      (chartHeight + 44) * label.length
    }px`;
    label.forEach((item, index) => {
      title.push({
        textBaseline: "middle",
        top: 22 + (32 + chartHeight) * index,
        left: "5%",
        subtext: item,
      });
      grid.push({
        left: "5%",
        right: "1%",
        height: chartHeight,
        top: 22 + (32 + chartHeight) * index,
      });
      xAxis.push({
        data: times,
        type: "category",
        gridIndex: index,
      });
      yAxis.push({
        gridIndex: index,
      });

      data[index].forEach((d, i) => {
        series.push({
          name: SENSORLIST_NAME_EN1[i],
          type: "line",
          data: d,
          xAxisIndex: index,
          yAxisIndex: index,
          smooth: true, //是否平滑
          markArea: {
            silent: true,
            itemStyle: {
              color: "#ddd",
              opacity: 0.1,
            },
            // data: [
            //   [
            //     {
            //       xAxis: "20170103",
            //     },
            //     {
            //       xAxis: "20171227",
            //     },
            //   ],
            //   [
            //     {
            //       xAxis: "20190103",
            //     },
            //     {
            //       xAxis: "20191227",
            //     },
            //   ],
            //   [
            //     {
            //       xAxis: "20210105",
            //     },
            //     {
            //       xAxis: "20211224",
            //     },
            //   ],
            // ],
          },
        });
      });
    });
    const option = {
      title: title,
      tooltip: {
        trigger: "axis",
        formatter: function (params) {
          let tip = params.map((item, index) => {
            return (
              item.marker +
              SENSORLIST_NAME_EN1[item.componentIndex % 10] +
              " " +
              item.value
            );
          });
          let result = params[0].name + "<br/>";
          for (let i of tip) {
            result += i + "<br/>";
          }
          return result;
        },
      },
      grid: grid,
      xAxis: xAxis,
      yAxis: yAxis,
      series: series,
      color: COLORLIST.slice(0, 10),
      legend: {
        show: true,
        top: 0,
        left: "10%",
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1, 2,3,4,5,6,7,8,9],
          start: 0,
          end: 100,
        },
        {
          type: "slider",
          start: 0,
          end: 100,
          xAxisIndex: [0, 1, 2,3,45,6,7,8,9],
          height: 20,
          bottom:30 ,
        },
      ],
    };

    let existInstance = echarts.getInstanceByDom(groupLinesRef.current);
    if (existInstance !== undefined) {
      echarts.dispose(existInstance);
    }

    const myChart = echarts.init(groupLinesRef.current);
    myChart.setOption(option, true);
    // 返回时间
    myChart.on("click", (e) => {
      const timeStamp = e.name;
      let sIndex = parseInt(e.seriesIndex / 10);
      let polluIndex = POLLUTANTLIST_NAME.indexOf(label[sIndex]);
      setRangeBarTimeStampIdx(timeStamp);
      setRangeBarPollutantIdx(polluIndex);
    });
  };



  return (
    <div className="group-lines">
      <div
        id="chart-line"
        style={{
          width: "100%",
          height: "900px",
          overflowY: "scroll",
        }}
      >
        <div style={{ width: "100%" }} ref={groupLinesRef}></div>
      </div>
    </div>
  );
};

export default GroupLines;
