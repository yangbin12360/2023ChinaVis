import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState,useRef } from 'react';
import { svg } from 'd3';
import {getActionAndRoadCount} from '../../apis/api'
import echarts from 'echarts'
//import echarts from 'echarts/lib/echarts'
import ReactEcharts from 'echarts-for-react';
import { Radio } from "antd";

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

    // const converTimestring = (timestring) => {
    //      const timestringComplete = timestring+":"+"56";
    //      const timestamp = timestringComplete
    // }

    var time = [];
    var timestamp = [];
    for(var i=1681315496;i<=1681401596;i =i+300){
        time.push(converTimestamp(i));
        timestamp.push(i);
    }
    console.log(time);
    // var count = [];
    // var action =[];
    var name=['车道1','车道2','车道3','车道4','车道5','车道6','车道7','车道8','车道9',]
    var label = ['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'];
    // for(var k = 0;k<8;k++){
    //     action = [];
    //     for(var j=0;j<=8;j++){
    //         count = [];
    //         for(var i=1;i<289;i++){
    //            count.push(Math.random()*100);
    //         }
    //         action.push(count)
    //     }
    //     dataset.push(action);
    // }

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
      console.log(series);
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
          left: "20%",
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
      
      //点击点获取横坐标值
      myChart.on("click", function (param) {
        var getX = timestamp[param.dataIndex];//横坐标的值
        console.log(getX);
        })

    }

    useEffect(() => {
        getActionAndRoadCount().then(res => {
         let dataset = res;
         //console.log(dataset);
         drawRelationPlot(dataset);
        })
    },[])

    return (
        <div style={{height:'400px',width:'100%',overflowY:'auto'}}>
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
        {/* <div id='relationShipScence1'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence2'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence3'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence4'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence5'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence6'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence7'style={{height:'40%',width:'100%'}}></div>
        <div id='relationShipScence8'style={{height:'40%',width:'100%'}}></div> */}
        
        </div>
    );
}

export default RelationshipScene;