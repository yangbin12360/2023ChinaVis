import * as echarts from "echarts";
import React,{useEffect, useRef} from "react";
import { getRoadHealth } from "../../apis/api";

import "./roadHealth.css"

const RoadHealth =()=>{
    const roadHealthRef = useRef(null);
    
    useEffect(()=>{
      getRoadHealth().then(res => {
        let healthData = res
        drwaRoadHealth( healthData)
      })

    },[])
    const drwaRoadHealth = (healthData)=>{
        let existInstance = echarts.getInstanceByDom(roadHealthRef.current);
        if(existInstance !==undefined){
            echarts.dispose(existInstance)
        }
        const myChart = echarts.init(roadHealthRef.current);
// 中车道数据
const r0 = healthData[0];
const r1 = healthData[1];
const r2 = healthData[2];
const r3 = healthData[3];
const r4 = healthData[4];
const r5 = healthData[5];
const r6 = healthData[6];
const r7 = healthData[7];
const r8 = healthData[8];

  var schema = [
    { name: 'time', index: 0, text: '时间' },
    { name: 'flow', index: 1, text: '车流量' },
    { name: 'velocity', index: 2, text: '速度' },
    { name: 'bus', index: 3, text: '社会车辆/公交比' },
    { name: 'num', index: 4, text: ' 小车道号' },
  ];
  var lineStyle = {
    width: 1,
    opacity: 0.5
  };
  const option = {
    backgroundColor: '#fff',
    legend: {
      bottom: 10,
      data: ['中车道0', '中车道1', '中车道2', '中车道3', '中车道4', '中车道5', '中车道6', '中车道7', '中车道8'],
      itemGap: 25,
      textStyle: {
        color: 'black',
        fontSize:10
      }
    },
    parallelAxis: [
      {
        dim: 0,
        name: schema[0].text,
        max: 23
        // inverse: true,
        // max: 23,
        // nameLocation: 'start'
      },
      { dim: 1, name: schema[1].text },
      { dim: 2, name: schema[2].text },
      { dim: 3, name: schema[3].text },
      { dim: 4, name: schema[4].text ,max: 33},
    ],
    parallel: {
      left: '5%',
      right: '8%',
      bottom:"30%",
    //   bottom: '100%',
      parallelAxisDefault: {
        type: 'value',
        name: '时间',
        nameLocation: 'end',
        nameGap: 20,
        nameTextStyle: {
          color: 'black',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: 'black'
          }
        },
        axisTick: {
          lineStyle: {
            color: 'black'
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: 'black'
        }
      }
    },
    series: [
      {
        name: '中车道0',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r0
      },
      {
        name: '中车道1',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r1
      },
      {
        name: '中车道2',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r2
      }, {
        name: '中车道3',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r3
      },
      {
        name: '中车道4',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r4
      },
      {
        name: '中车道5',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r5
      }, {
        name: '中车道6',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r6
      },
      {
        name: '中车道7',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r7
      },
      {
        name: '中车道8',
        type: 'parallel',
        lineStyle: lineStyle,
        data: r8
      }
    ]
  };
        myChart.setOption(option)
        window.onresize = myChart.resize;
    }
    return(
        <div className="container" ref={roadHealthRef}  id="roadHealth"></div>
    )
}
export default RoadHealth;
