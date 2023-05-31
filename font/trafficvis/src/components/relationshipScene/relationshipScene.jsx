import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState,useRef } from 'react';
import { svg } from 'd3';
import {getActionAndRoadCount,detail_item} from '../../apis/api'
import echarts from 'echarts'
//import echarts from 'echarts/lib/echarts'
import ReactEcharts from 'echarts-for-react';
import { Radio } from "antd";
import "./relationShip.less";

//导入echarts折线图

// function RelationshipScene (){
//     useEffect(() => {
//         getActionAndRoadCount().then(res => {
//          let data = res;
//          drawRelationPlot(data);
//         })
//     },[])

//     function drawRelationPlot(data24){
//     console.log(data24);
//     const action = ['car_cross','long_time','nomotor_cross','overSpeeding','people_cross','reverse','speedDown','speedUp'];
//     const colorchoose = ['blue','green','orange','red'];

//     let width = document.getElementById('relationContainer').clientWidth-10;
//     let height= document.getElementById('relationContainer').clientHeight-10;
//     let padding_left=70
//     let padding_top=30
//     //创建画布
//     let svg = d3.select('#relationContainer')
//                 .append('svg')
//                 .attr('width',width+padding_left)
//                 .attr('height',height+padding_top);
//     //设置鼠标缩放
//     var zoom = d3.zoom()
//     .scaleExtent([0.1, 10]) // 鼠标缩放的距离, 范围
//     .on('start', () => { // zoom 事件发生前 将变小手
//         console.log('start')
//         svg.style('cursor', 'pointer')
//     })
//     .on('zoom', (e) => {
//         console.log(e)
//         svg.attr('transform',
//             'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')'
//         )
//     })
//     .on('end', () => {
//         svg.style('cursor', 'default')
//     });

// svg.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(1))

//     //x轴标尺
//     let xScale = d3.scaleLinear()
//                     .domain([1,24])
//                     .range([padding_left,width-padding_left/4]);
//     //y轴标尺
//     let yScale = d3.scaleBand()
//                     .domain(['car_cross','long_time','nomotor_cross','overSpeeding','people_cross','reverse','speedDown','speedUp'])
//                     .range([0-padding_top,height-2*padding_top]);
//     const minpadding = () => {
//         if((xScale(1)-xScale(0))/2<yScale.bandwidth()/2){
//             return (xScale(1)-xScale(0))/2;
//         }
//         else {
//             return yScale.bandwidth()/2;
//         }
//     }
//     //圆点半径标尺
//     let rScale = d3.scaleLinear()
//                    .domain([0,d3.max(data24,function(d){
//                         return eval(d.road_count.join("+"));
//                    })])
//                    .range([0,minpadding()-5]);
//     //x坐标轴
//     let xAxis=d3.axisBottom()
//                 .scale(xScale)
//                 .ticks(25);  
//     //y坐标轴
//     let yAxis=d3.axisLeft()
//                 .scale(yScale)
//                 .ticks(9);

//     //把坐标轴添加到画布中
//     svg.append('g')
//        .attr('id','relationXaxis')
//        .attr('class','axis')
//        .attr("transform","translate("+0+","+(height-padding_top)+")")
//        .call(xAxis);
//     svg.append('g')
//         .attr('id','relationYaxis')
//        .attr('class','axis')
//        .attr("transform","translate("+padding_left+","+padding_top+")")
//        .call(yAxis);
//     // d3.select('#relationXaxis')
//     //     .selectAll('path')
//     //     .remove();
//     // d3.select('#relationXaxis')
//     //     .selectAll('line')
//     //     .remove();
//     // d3.select('#relationYaxis')
//     //     .selectAll('path')
//     //     .remove();
//     // d3.select('#relationYaxis')
//     //     .selectAll('line')
//     //     .remove();
//     // //添加x轴坐标名称
//     // svg.append("text")
//     //    .attr("transform", "translate(" +(width-padding_left/2) + "," + (height+padding_top/2)+ ")")
//     //    .style("text-anchor", "middle")
//     //    .text("时间/h");
//     // //添加y轴坐标名称
//     // svg.append("text")
//     //    .attr("transform", "translate(" + padding_left/2 + "," + padding_top+ ")")
//     //    .style("text-anchor", "middle")
//     //    .text("高价值场景");

//     //画点和饼图圆弧
//     //车道分布圆弧
//     var pieSvg = svg.append('g').attr('id','piesvg');
//     var pie=d3.pie()
//               .value(function(d){return d;});
              
    
//     data24.forEach(function(value,index){
//         var arc=d3.arc()
//               .innerRadius(rScale(value.action_count)+1)
//               .outerRadius(rScale(value.action_count)+2);
//         var piedata = pie(value.road_count);
//         pieSvg.append('g')
//               .selectAll('path')
//               .data(piedata)
//               .enter()
//               .append("path")
//               .attr("d",function(d){
//                   return arc(d);
//               })
//               .attr("fill",function(d,i){
//                   return colorchoose[i];
//               })
//              .attr("transform","translate("+xScale(value.action_hour+1)+","+(yScale(value.action_type)+2*padding_top)+")");
//     })
    
    
//     svg.selectAll('circle')
//        .data(data24)
//        .enter()
//        .append('circle')
//        .attr('cx',function(d){
//         return xScale(d.action_hour+1);
//        })
//        .attr('cy',function(d){
//         return yScale(d.action_type)+2*padding_top;
//        })
//        .attr('r',function(d){
//         //return 1;
//         return rScale(d.action_count)
//        })
//        .attr('fill','grey');
    
//     }
// //视图更新
//     function updateRelationPlot(totalTime){
//     //假数据
    
//         const action = ['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'];
//         const colorchoose = ['blue','green','orange','red'];
    
//         let width = document.getElementById('relationContainer').clientWidth-10;
//         let height= document.getElementById('relationContainer').clientHeight-10;
//         let padding_left=70
//         let padding_top=20
//         //创建画布
//         let svg = d3.select('#relationContainer')
//                     .select('svg');
//         svg.selectAll("*").remove();
        

//     }
//     //用于切换小时分钟
//     const[total,setTotal] = useState(24);


//     useEffect(()=>{
//         console.log(total)
//         updateRelationPlot(total);
//     },[total])

//     return (
//         <>
//          <button onClick={() => {setTotal(60)}}></button>
//          <button onClick={() => {setTotal(24)}}>回退</button>
//         <div id='relationContainer' style={{width:'100%',height:'100%'}}></div>
       
//         </>
//     ) 
    
// }

// export default RelationshipScene;

function RelationshipScene(){
    const groupLinesRef = useRef(null);
    const toolRef = useRef(null);
    const [isZoomForAll, setIsZoomForAll] = useState("unify");
    const dataZoom = useRef(null);
    const [time,setTime] = useState(1681315196);
    const [carNum,setcarNum] = useState(0);
    const [scence,setScence] = useState(0);
    const [dataset,setDataTese] = useState([]);

    var name=['车道1','车道2','车道3','车道4','车道5','车道6','车道7','车道8','车道9'];
    var label = ['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'];
    var type = ['','小型车辆','行人','非机动车','卡车','','客车','静态物体','','','手推车、三轮车'];

    //时间戳的完整转换
    const converTimestampall = (timestamp) => {

      // 将微秒时间戳转换为毫秒
      const milliseconds = timestamp * 1000;
      // 使用毫秒时间戳创建一个新的 Date 对象
      const date = new Date(milliseconds);
      // 返回日期和时间字符串
      const timestring = date.toLocaleString("en-US", { hour12: false });

      return timestring;
  };

    function drawRelationPlot(dataset){

            //16位时间戳转换
    const converTimestamp = (timestamp) => {
        // 将微秒时间戳转换为毫秒
        const milliseconds = timestamp * 1000;
        // 使用毫秒时间戳创建一个新的 Date 对象
        const date = new Date(milliseconds);
        // 返回日期和时间字符串
        const timestring = date.toLocaleTimeString("en-US", { hour12: false }).split(":")[0]+":"+date.toLocaleTimeString("en-US", { hour12: false }).split(":")[1];

        return timestring;
    };
   

    var time = [];
    var timestamp = [];
    for(var i=1681315496;i<=1681401596;i =i+300){
        time.push(converTimestamp(i));
        timestamp.push(i);
    }
    console.log(time);

    console.log(dataset);
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
          subtextStyle: {color:'black'} ,
        });
        grid.push({
          left: "5%",
          right: "1%",
          height: chartHeight,
          top: 22 + (32 + chartHeight) * index,
        });
        xAxis.push({
          data: time,
          type: "category",
          gridIndex: index,
        });
        yAxis.push({
          gridIndex: index,
        });
       
        dataset[index].forEach((d, i) => {
            series.push({
              name: name[i],
              type: "line",
              data: d,
              id:index+'-'+i,
              xAxisIndex: index,
              yAxisIndex: index,
              smooth: true, //是否平滑
              markArea: {
                silent: true,
                itemStyle: {
                  color: "#ddd",
                  opacity: 0.1,
                },
              },
            });
          });
      });
      //console.log(series);
      const option = {
        title: title,
        tooltip: {
          trigger: "axis",
          //formatter: function (params) {
        //     let tip = params.map((item, index) => {
        //       return (
        //         item.marker +
        //         // SENSORLIST_NAME_EN1[item.componentIndex % 10] +
        //         " " +
        //         item.value
        //       );
        //     });
        //     let result = params[0].name + "<br/>";
        //     for (let i of tip) {
        //       result += i + "<br/>";
        //     }
        //     return result;
          // },
        },
        grid: grid,
        xAxis: xAxis,
        yAxis: yAxis,
        series: series,
        // color: COLORLIST.slice(0, 10),
        legend: {
          show: true,
          top: 0,
          left: "10%",
        },
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0, 1, 2,3,4,5,6,7],
            start: 0,
            end: 20,
            x:20,
            y:20,
          },
          {
            type: "slider",
            start: 0,
            end: 20,
             xAxisIndex: [0, 1, 2,3,4,5,6,7],
            height: 20,
            bottom:20 ,
          },
        ],
      };

      let existInstance = echarts.getInstanceByDom(groupLinesRef.current);
      if (existInstance !== undefined) {
        echarts.dispose(existInstance);
      }
  
      const myChart = echarts.init(groupLinesRef.current);
      myChart.setOption(option, true);
      
      //点击点获取时间戳、中车道车号[0-6]对应[车道1-车道7]、高价值场景序号[0-7]分别对应['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速']
      myChart.on("click", function (param) {
        console.log(param);
        var getX = timestamp[param.dataIndex]-300;//横坐标的值
        var getName =parseInt(param.seriesId.split('-')[1]);
        var getScence = parseInt(param.seriesId.split('-')[0]);
        setTime(getX);
        setcarNum(getName);
        setScence(getScence);
        //console.log(getX,getName,getScence);
        })

    }

    useEffect(() => {
        getActionAndRoadCount().then(res => {
         let dataset = res;
         drawRelationPlot(dataset);
        })
    },[])

//所有事件的细节模板
    function DrawDetailScence(){
     if( scence == 0){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         切入切出次数: {item.count}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
     }
     else if( scence == 1){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         结束时间: {converTimestampall(item.end_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
     }
     else if( scence == 2){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         结束时间: {converTimestampall(item.end_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    else if( scence == 3){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         平均速度： {item.mean_velo} m/s<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         结束时间: {converTimestampall(item.end_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    else if( scence == 4){ 
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         结束时间: {converTimestampall(item.end_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    else if( scence == 5){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         逆行朝向： {item.heading}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         结束时间: {converTimestampall(item.end_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    else if( scence == 6){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         急减速持续时间： {item.speedDown_time} s<br/><br/>
         急减速起始速度： {item.start_velocity} m/s<br/><br/>
         急减速结束速度： {item.end_velocity} m/s<br/><br/>
         急减速开始位置： {item.start_position}<br/><br/>
         急减速结束位置： {item.end_position}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    else if( scence == 7){
      return(    
        <>
        <ul>
        {
         dataset.map((item,index) => <li key = {index} style={{height:200,fontFamily:'微软雅黑'}}>
         id: {item.id}<br/><br/>
         参与者类型: {type[item.type]}<br/><br/>
         急加速持续时间： {item.speedUp_time} s<br/><br/>
         急加速起始速度： {item.start_velocity} m/s<br/><br/>
         急加速结束速度： {item.end_velocity} m/s<br/><br/>
         急加速开始位置： {item.start_position}<br/><br/>
         急加速结束位置： {item.end_position}<br/><br/>
         开始时间: {converTimestampall(item.start_time/1000000)}<br/><br/>
         </li>)
        }
      </ul>
      </>
      );
    }
    }

    useEffect(() => {
      // var datatest = [
      //   {id:carNum,type:'小型车辆',vol:'20',startTime:time,endTime:'354131312'},
      //   {id:'1244353',type:'小型车辆',vol:'20',startTime:'1564324356',endTime:'3541315532'},
      //   {id:'1575353',type:'卡车',vol:'25',startTime:'1564334256',endTime:'35412512'},
      //   {id:'1247853',type:'小型车辆',vol:'20',startTime:'15643342356',endTime:'354131312'}
      // ];
      console.log(scence);
      detail_item(time,carNum,scence).then(res => {
        var dataDetail = res;
        console.log(dataDetail);
        setDataTese(dataDetail);
      })

    },[carNum,time,scence])
    


    return (
      <div style={{position:'relative'}}>
        <div style={{height:'400px',width:'70%',overflowY:'auto'}}>
             <div className="group-lines-bar">
          {/* <Radio.Group
            value={isZoomForAll}
            onChange={(e) => {
              setIsZoomForAll(e.target.value);
              console.log(isZoomForAll);
            }}
            size="small"
          >
            <Radio value={"indiv"}>Zoom for one</Radio>
            <Radio value={"unify"}>Zoom for all</Radio>
          </Radio.Group> */}
        </div>
            <div style={{ width: "100%" }} ref={groupLinesRef}></div>

        </div>
        <div className = 'detail' style={{height:'400px',width:'30%',overflowY:'auto',left:'70%', top:'0%',position:'absolute'}}> 
        <p id = 'information' style={{lineHeight:'180%'}}>在{converTimestampall(time)}所在5分钟内,车道{carNum+1}的{label[scence]}场景详细信息如下：</p>
        <div id = 'detailInformation'>
          <DrawDetailScence></DrawDetailScence>
        </div>
        </div>
        </div>
    );
}
export default RelationshipScene;