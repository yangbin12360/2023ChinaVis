import * as echarts from "echarts";
import React,{useEffect, useRef,useState} from "react";
import { getRoadHealth,getBigRoadHealth } from "../../apis/api";

import "./roadHealth.css"

const RoadHealth =()=>{
    const roadHealthRef = useRef(null);
    const roadNewHealthRef = useRef(null);
    const [chartType,setchartType] = useState(true);
    const [buttonContent,setButtonContent] = useState('切换至中车道健康度');

    //计算综合指标
    function computeHealth(){

    }
    useEffect(()=>{
      if(chartType == true){
        getRoadHealth().then(res => {
          let temp = res;
          let healthData = [[],[]];
          temp.forEach((item,index) =>{
            item.forEach((d) => {
              if(d[0] == 0 && d[2]<5){
                d.splice(0, 1);
                d.push("优秀");
                healthData[0].push(d);
              }
              else if(d[0] == 0 && d[2]>=5){
               d.splice(0, 1);
                d.push("良好");
                healthData[1].push(d);
            }
            })
          })           
          console.log(healthData);
          drwaRoadHealth( healthData)
        })
      }
      else{
        getBigRoadHealth().then(res => {
          let temp = res;
          let healthData = [[],[]];
          let bigcarnum = ['A','B','C','D','E','F','G','H','I'];
          temp.forEach((item,index) =>{
            item.forEach((d) => {
              d.push(bigcarnum[index]);
              if (d[0] == 0 && d[2]<5){
                d.splice(0, 1);
                d.push("优秀");
                healthData[0].push(d);
              }
              else if(d[0] == 0 && d[2]>=5){
                d.splice(0, 1);
                d.push("良好");
                healthData[1].push(d);
            }
            })
          })           
          drwaRoadHealth(healthData)
        })
      }
    },[chartType])

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
   // { name: 'time', index: 0, text: '时间' },
    { name: 'flow', index: 0, text: '车流量' },
    { name: 'velocity', index: 1, text: '速度' },
    { name: 'bus', index: 2, text: '社会车辆/公交比' },
    { name: 'num', index: 3, text: ' 小车道号' },
    { name: 'health', index: 4, text: ' 健康度' },
    { name: 'bignum', index: 5, text: ' 中车道号' },
  ];
  var lineStyle = {
    width: 1,
    opacity: 0.5
  };
  var option = {}
  if(chartType == true){
    option = {
      color:['rgb(46, 196, 182)','rgb(217,164, 14)','rgb(118, 200, 147)','rgb(82, 182, 154)','rgb(52, 160, 164)','rgb(169, 214, 229)','rgb(5, 130, 202)','rgb(30, 96, 145)','rgb(20, 33, 61)'],
      backgroundColor: '#efefef',
      legend: {
        bottom: 10,
        data: [ '良好','优秀'],
        itemGap: 25,
        textStyle: {
          color: 'black',
          fontSize:10
        }
      },
      parallelAxis: [
        {
          dim: 0,
          name: schema[0].text
          // inverse: true,
          // max: 23,
          // nameLocation: 'start'
        },
        { dim: 1, name: schema[1].text },
        { dim: 2, name: schema[2].text },
        { dim: 3, name: schema[3].text,max: 33 },
        {
          dim: 4,
          name: schema[4].text,
          type: 'category',
          data: [ '良好','优秀']
        }
      ],
      parallel: {
        left: '5%',
        right: '8%',
        bottom:"20%",
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
          name: '优秀',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r0
        },
        {
          name: '良好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r1
        }
      ]
    };
  }
  else{
    option = {
      color:['rgb(46, 196, 182)','rgb(217,164, 14)','rgb(118, 200, 147)','rgb(82, 182, 154)','rgb(52, 160, 164)','rgb(169, 214, 229)','rgb(5, 130, 202)','rgb(30, 96, 145)','rgb(20, 33, 61)'],
      backgroundColor: '#efefef',
      legend: {
        bottom: 10,
        data: [ '良好','优秀'],
        itemGap: 25,
        textStyle: {
          color: 'black',
          fontSize:10
        }
      },
      tooltip: {
        padding: 10,
        backgroundColor: '#222',
        borderColor: '#777',
        borderWidth: 1
      },
      parallelAxis: [
        {
          dim: 0,
          name: schema[0].text,
          // inverse: true,
          // max: 23,
          // nameLocation: 'start'
        },
        { dim: 1, name: schema[1].text },
        { dim: 2, name: schema[2].text },
        {
          dim:3,
          name: schema[5].text,
          type: 'category',
          data: ['I','H','G','F','E','D','C','B','A']
        },
        {
          dim: 4,
          name: schema[4].text,
          type: 'category',
          data: [ '良好','优秀']
        }
      ],
      parallel: {
        left: '5%',
        right: '8%',
        bottom:"20%",
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
          name: '优秀',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r0
        },
        {
          name: '良好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r1
        }
      ]
    };
  }
  
        myChart.setOption(option)
        window.onresize = myChart.resize;
    }

  
    return(
        <>   
        <div className="container" ref={roadHealthRef}  id="roadHealth"></div>
        <button onClick={() => {
          setchartType(!chartType)
          if(chartType){
            setButtonContent('切换至小车道健康度');
          }
          else{
            setButtonContent('切换至中车道健康度');
          }
        } } style = {{position:'absolute',background:"#e8e8e4",width:130,height:20,top:"92%",left:"75%",borderRadius:20,border:'2px solid #cccccc',fontSize:'12px'}}>{buttonContent}</button>
        </>

    )
}
export default RoadHealth;
