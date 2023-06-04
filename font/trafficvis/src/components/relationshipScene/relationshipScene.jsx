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


function RelationshipScene(props){
    const groupLinesRef = useRef(null);
    const toolRef = useRef(null);
    const [isZoomForAll, setIsZoomForAll] = useState("unify");
    const dataZoom = useRef(null);
    const [tipyFlag,setTipyFlag] = useState(false);
    const [tipyContent,setTipyContent] = useState("");
    const [tipyX,setTipyX] = useState('0px');
    const [tipyY,setTipyY] = useState('0px');
    const{time,carNum,scence,handleDetail} = props;
    // const [dataset,setDataTese] = useState([]);
    var name=['车道0','车道1','车道2','车道3','车道4','车道5','车道6','车道7','车道8'];
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
         

    function drawRelationPlot(dataset){
    var time = [];
    var timestamp = [];
    for(var i=1681315496;i<=1681401596;i =i+300){
        time.push(converTimestamp(i));
        timestamp.push(i);
    }
    console.log(time);

    console.log(dataset);
    var color=['rgb(46, 196, 182)','rgb(217,164, 14)','rgb(118, 200, 147)','rgb(82, 182, 154)','rgb(52, 160, 164)','rgb(169, 214, 229)','rgb(5, 130, 202)','rgb(30, 96, 145)','rgb(24, 78, 119)'];
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
         //console.log(color[i].split(')')[0]+'0.8)')
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
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: color[i].split(')')[0]+',0.8)'
                  },
                  {
                    offset: 1,
                    color: color[i].split(')')[0]+',0.1)'
                  }
                ])
              },
            });
          });
      });
      //console.log(series);
      const option = {
        color:['rgb(46, 196, 182)','rgb(217,164, 14)','rgb(118, 200, 147)','rgb(82, 182, 154)','rgb(52, 160, 164)','rgb(169, 214, 229)','rgb(5, 130, 202)','rgb(30, 96, 145)','rgb(24, 78, 119)'],
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
          selected: {
            '车道1': true,
            '车道2': true,
            '车道3': true,
            '车道4': true,
            '车道5': true,
            '车道6': false,
            '车道7': false,
            '车道8': false,
            '车道9': false,
        }
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
        //console.log(param);
        var getX = timestamp[param.dataIndex]-300;//横坐标的值
        var getName =parseInt(param.seriesId.split('-')[1]);
        var getScence = parseInt(param.seriesId.split('-')[0]);
        handleDetail(getX,getName,getScence);
        })
    }

    useEffect(() => {
        getActionAndRoadCount().then(res => {
         let dataset = res;
         console.log(dataset);
         drawRelationPlot(dataset);
        })
    },[])
//   var arcdata = { startAngle: Math.PI * -0.3 , endAngle: Math.PI * 0.3 };
//   var arcPath = d3.arc()
//                   .innerRadius(35)
//                   .outerRadius(55);
//   var arcPathSmall = d3.arc()
//                         .innerRadius(20)
//                         .outerRadius(35);


//   var triangle = d3.symbol()
//                    .type(d3.symbolTriangle)
//                    .size(20);



//   //鼠标事件展示弧形信息
//   function detailtipyinfo(flag){
//     if(flag == true){
//       return function(g,i){
//         setTipyFlag(true);
//         var value = g.srcElement.attributes.value.value;
//         setTipyContent("切入切出次数："+value);
//         setTipyX(g.offsetX+'px');
//         setTipyY(g.offsetY+'px');
//         }
//     }
//     else {
//       return function(g,i){
//         setTipyFlag(false);
//       }
//     }     
// }
//   //鼠标事件展示弧形信息
//   function detailtipyvelo(flag){
//     if(flag == true){
//       return function(g,i){
//         setTipyFlag(true);
//         var value = g.srcElement.attributes.value.value;
//         setTipyContent("速度："+value);
//         setTipyX(g.offsetX+'px');
//         setTipyY(g.offsetY+'px');
//         }
//     }
//     else {
//       return function(g,i){
//         setTipyFlag(false);
//       }
//     }     
// }
// //所有事件的细节模板
//     function DrawDetailScence(dataset){
//       var scale = d3.scaleLinear()
//                     .domain([0,4])
//       .range([-0.3,0.3]);
      
//       var vscale = d3.scaleLinear()
//                      .domain([0,4])
//                      .range([-0.3,0.3]);
//         //将数据转换为弧度点的形式
//       function transformDataInfo(data){
//         return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * scale(data) };
//       }

//       function transformDataVelo(data){
//         return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * vscale(data) };
//       }

//       d3.select('#detailInformation').selectAll('*').remove();
//       var arcsvg = d3.select('#detailInformation')
//       .append('svg')
//       .attr('id','arcsvg')
//       .attr('width','100%')
//       .attr("transform","translate(0,10)");
//       var padding = (document.getElementById('arcsvg').clientWidth-160)/3;
//       console.log(document.getElementById('arcsvg').clientWidth);

//      if( scence == 0){
//     dataset.map((item,index) => {
//       console.log(index);
//       arcsvg.append("path")
//             .attr("d",arcPath(arcdata))	
//             .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//             .attr("stroke","black")
//             .attr("stroke-width","3px")
//             .attr("fill","white");
//      var info =  arcsvg.append("path")
//             .attr("d",arcPath(transformDataInfo(3)))	
//             .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//             .attr('value',3)
//             .attr("stroke","black")
//             .attr("stroke-width","3px")
//             .attr("fill","yellow");
//       arcsvg.append("path")
//             .attr("d",arcPathSmall(arcdata))	
//             .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//             .attr("stroke","black")
//             .attr("stroke-width","3px")
//             .attr("fill","white");
//       var velo = arcsvg.append("path")
//             .attr("d",arcPathSmall(transformDataVelo(1)))	
//             .attr('value',1)
//             .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//             .attr("stroke","black")
//             .attr("stroke-width","3px")
//             .attr("fill","yellow");
//       arcsvg.append("path")
//             .attr("d", triangle)
//             .attr("stroke", 'black')
//             .attr("fill", 'black')
//             .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//       arcsvg.append("text")
//             .text('特征信息')
//             .attr('font-size','11px')
//             .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//       arcsvg.append("text")
//             .text('速度')
//             .attr('font-size','11px')
//             .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//       arcsvg.append("text")
//             .text('id：')
//             .attr('font-size','13px')
//             .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//       arcsvg.append("text")
//             .text('开始：')
//             .attr('font-size','13px')
//             .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//       arcsvg.append("text")
//             .text('结束：')
//             .attr('font-size','13px')
//             .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//       arcsvg.append("text")
//             .text(item.id)
//             .attr('font-size','13px')
//             .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//       arcsvg.append("text")
//             .text(converTimestamp(item.start_time/1000000))
//             .attr('font-size','13px')
//             .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//       arcsvg.append("text")
//             .text(converTimestamp(item.start_time/1000000))
//             .attr('font-size','13px')
//             .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");

//     var svgS1 = document.getElementById('arcsvg');
//     var svgh = svgS1.getBBox();
//     svgS1.style.height = svgh.y+svgh.height+20;

//     info.on('mouseover',detailtipyinfo(true))
//         .on('mouseout',detailtipyinfo(false));

//     velo.on('mouseover',detailtipyvelo(true))
//         .on('mouseout',detailtipyvelo(false));
//     })

//      }
//      else if( scence == 1){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//      }
//      else if( scence == 2){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     else if( scence == 3){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     else if( scence == 4){ 
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     else if( scence == 5){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     else if( scence == 6){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     else if( scence == 7){
//       dataset.map((item,index) => {
//         console.log(index);
//         arcsvg.append("path")
//               .attr("d",arcPath(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//        var info =  arcsvg.append("path")
//               .attr("d",arcPath(transformDataInfo(3)))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//               .attr('value',3)
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d",arcPathSmall(arcdata))	
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","white");
//         var velo = arcsvg.append("path")
//               .attr("d",arcPathSmall(transformDataVelo(1)))	
//               .attr('value',1)
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+")")
//               .attr("stroke","black")
//               .attr("stroke-width","3px")
//               .attr("fill","yellow");
//         arcsvg.append("path")
//               .attr("d", triangle)
//               .attr("stroke", 'black')
//               .attr("fill", 'black')
//               .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4)))+") rotate(180)");
//         arcsvg.append("text")
//               .text('特征信息')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50)+")");
//         arcsvg.append("text")
//               .text('速度')
//               .attr('font-size','11px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4)))+")")
//         arcsvg.append("text")
//               .text('id：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text('开始：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");      
//         arcsvg.append("text")
//               .text('结束：')
//               .attr('font-size','13px')
//               .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");            
//         arcsvg.append("text")
//               .text(item.id)
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4)))+")");
//         arcsvg.append("text")
//               .text(converTimestamp(item.start_time/1000000))
//               .attr('font-size','13px')
//               .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4)))+")");
  
//       var svgS1 = document.getElementById('arcsvg');
//       var svgh = svgS1.getBBox();
//       svgS1.style.height = svgh.y+svgh.height+20;
  
//       info.on('mouseover',detailtipyinfo(true))
//           .on('mouseout',detailtipyinfo(false));
  
//       velo.on('mouseover',detailtipyvelo(true))
//           .on('mouseout',detailtipyvelo(false));
//       })
//     }
//     }

//     useEffect(() => {

//       detail_item(time,carNum,scence).then(res => {
//         var dataDetail = res;
//         DrawDetailScence(dataDetail );
//       })

//     },[carNum,time,scence])
    


    return (
      <div style={{position:'relative', background:'#efefef'}}>
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

        </div>
        {/* <div className = 'detail' style={{height:'400px',width:'40%',left:'60%', top:'0%',position:'absolute'}}> 
        <div style={{height:'20%'}}>
        <p id = 'information' style={{lineHeight:'180%'}}>在{converTimestampall(time)}所在5分钟内,车道{carNum+1}的{label[scence]}场景详细信息如下：</p>
        </div>

        <div id = 'detailInformation' style={{height:'80%',width:'100%',overflowY:'auto',position:'relative'}}>
        
         {tipyFlag ? <div className ="tip" id="flow_tip" 
        style={{width:"150px",height:"25px",position:'absolute',top:tipyY,left:tipyX,background:'rgba(161,161,161,0.6)',textAlign:'center'}}>
            {tipyContent}
            </div> : null }
        </div>
        </div> */}
        </div>
    );
}
export default RelationshipScene;