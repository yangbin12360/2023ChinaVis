import * as echarts from "echarts";
import React,{useEffect, useRef,useState} from "react";
import { getRoadHealth,getBigRoadHealth } from "../../apis/api";

import "./roadHealth.css"

const RoadHealth =(props)=>{
    const roadHealthRef = useRef(null);
    const roadNewHealthRef = useRef(null);
    const [chartType,setchartType] = useState(true);
    const [buttonContent,setButtonContent] = useState('切换至中车道健康度');
    const {hourindex} = props;
    const maxFlow = [140, 390, 187, 214, 248, 327, 486, 172, 134, 627, 651, 511, 465, 541, 533, 324, 135, 242, 323, 302, 64, 184, 374, 287, 132, 189, 169, 16, 60, 33, 29, 85, 8, 0];
    const maxVelo = [29.088037626809125, 36.4941257043837, 28.287433249875004, 54.30020157428571, 41.262377635826084, 39.4493577285, 32.756548534143526, 52.1522524, 33.3207456944762, 40.082529188571435, 37.6563883164, 24.372225905596093, 26.449291380175236, 33.556669049142855, 23.71443768, 30.697397342142857, 41.06758643999999, 35.45950868307692, 41.29865946260778, 42.51536898, 33.547326600000005, 33.19892429399453, 37.93535573531986, 33.28717776884917, 29.432005057948054, 20.440789626797393, 30.79506251273274, 41.10554378, 16.809003937338463, 31.2858088425, 18.330809000874076, 29.222140693025644, 10.87309008, 0.0];
    const maxPro = [1.1441024371913027, 2.1185500061395426, 1.8057009946559046, 2.1376622997903314, 1.4581373775004887, 1.525981186841357, 1.141423870848073, 1.005270285963216, 0.0, 1.9535772906513804, 1.2441502498390924, 1.1425773732297184, 2.2205252605229413, 2.0430991606531497, 2.1606367610637602, 1.7512927291354352, 1.0708726175265768, 1.198943234553371, 1.447037316810697, 1.3354849947019394, 1.5025849052706357, 1.1647993855550451, 1.324858134473964, 1.5471361332053926, 1.3104629817567863, 1.1171080747926767, 1.0871228696792214, 0.881213094565229, 1.7666759528022964, 0.0, 0.0, 1.1805061030411195, 0, 0];
    //计算综合指标
    function computeHealth(flow,velo,pro){
      let flowscore = flow/maxFlow[hourindex]*100;
      let veloscore = velo/maxVelo[hourindex]*100;
      let proscore = pro/maxPro[hourindex]*100;
      let score = flowscore*0.4+veloscore*0.4+proscore*0.2;
      // console.log(flowscore,veloscore, proscore,score)
      if(90<= score){
        return '极好';
      }
     else if(80<=score){
        return '良好';
      }
      else if(70<=score){
        return '一般';
      }
      else if(60<=score){
        return '较差';
      }
      else if(score<60){
        return '极差';
      }
  }

    useEffect(()=>{
      if(chartType == true){
        getRoadHealth().then(res => {
          let temp = res;
          let healthData = [[],[],[],[],[],[]];
          temp.forEach((item,index) =>{
            item.forEach((d) => {
              // console.log(d);
              if (d[0] == hourindex && computeHealth(d[1],d[2],d[3])=='极好'){
                d.splice(0, 1);
                d.push("极好");
                healthData[0].push(d);
              }
              else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='良好'){
                d.splice(0, 1);
                d.push("良好");
                healthData[1].push(d);
            }
            else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='一般'){
              d.splice(0, 1);
              d.push("一般");
              healthData[2].push(d);
          }
          else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='较差'){
            d.splice(0, 1);
            d.push("较差");
            healthData[3].push(d);
        }
        else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='极差'){
          d.splice(0, 1);
          d.push("极差");
          healthData[4].push(d);
      }
            })
          })           
          // console.log(healthData)
          drwaRoadHealth( healthData)
        })
      }
      else{
        getBigRoadHealth().then(res => {
          let temp = res;
          let healthData = [[],[],[],[],[]];
          let bigcarnum = ['A','B','C','D','E','F','G','H','I'];
          temp.forEach((item,index) =>{
            item.forEach((d) => {
              d.push(bigcarnum[index]);
              if (d[0] == hourindex && computeHealth(d[1],d[2],d[3])=='极好'){
                d.splice(0, 1);
                d.push("极好");
                healthData[0].push(d);
              }
              else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='良好'){
                d.splice(0, 1);
                d.push("良好");
                healthData[1].push(d);
            }
            else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='一般'){
              d.splice(0, 1);
              d.push("一般");
              healthData[2].push(d);
          }
          else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='较差'){
            d.splice(0, 1);
            d.push("较差");
            healthData[3].push(d);
        }
        else if(d[0] == hourindex &&  computeHealth(d[1],d[2],d[3])=='极差'){
          d.splice(0, 1);
          d.push("极差");
          healthData[4].push(d);
      }
            })
          })           
          drwaRoadHealth(healthData)
        })
      }
    },[chartType,hourindex])

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
    opacity: 0.8
  };
  var option = {}
  if(chartType == true){
    option = {
      color:['#4c9064','#b9d36c','#c2b847','rgb(217,164, 14)','#aa3333'],
      backgroundColor: '#efefef',
      legend: {
        bottom: 10,
        data: [ '极差','较差','一般','良好','极好'],
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
          data: [ '极差','较差','一般','良好','极好']
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
          name: '极好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r0
        },
        {
          name: '良好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r1
        },
        {
          name: '一般',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r2
        },
        {
          name: '较差',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r3
        },        
        {
          name: '极差',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r4
        }
      ]
    };
  }
  else{
    option = {
      color:['#4c9064','#b9d36c','#c2b847','rgb(217,164, 14)','#aa3333'],
      backgroundColor: '#efefef',
      legend: {
        bottom: 10,
        data: [ '极差','较差','一般','良好','极好'],
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
          data: [ '极差','较差','一般','良好','极好']
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
          name: '极好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r0
        },
        {
          name: '良好',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r1
        },
        {
          name: '一般',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r2
        },
        {
          name: '较差',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r3
        },        
        {
          name: '极差',
          type: 'parallel',
          lineStyle: lineStyle,
          data: r4
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
        } } style = {{position:'absolute',background:"#e8e8e4",width:130,height:20,top:"92%",left:"80%",borderRadius:20,border:'2px solid #cccccc',fontSize:'12px'}}>{buttonContent}</button>
        </>

    )
}
export default RoadHealth;
