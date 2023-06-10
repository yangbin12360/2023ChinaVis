import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState,useRef } from 'react';
import { svg } from 'd3';
import {getActionAndRoadCount,detail_item} from '../../apis/api'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react';
import { Radio } from "antd";



function Details (props){
    const [specialContent,setSpecialContent] = useState("");
    const [veloContent,setVeloContent] = useState("");
    const{time,carNum,scence,handleDetail} = props;
    const [carname,setCarName] = useState('中车道A');

    var name=['道路A','道路B','道路C','道路D','道路E','道路F','道路G','道路H','路口','非机动车道'];
    var label = ['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'];
    var type = ['','小型车辆','行人','非机动车','卡车','','客车','静态物体','','','手推车、三轮车'];
    var typecolor = ['','#5c677d','#79addc','#f19c79','#f4d35e','','#709775','','','','#ce4257'];
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

   //16位时间戳转换_精确到s
   const converTimestampS = (timestamp) => {
      // 将微秒时间戳转换为毫秒
      const milliseconds = timestamp * 1000;
      // 使用毫秒时间戳创建一个新的 Date 对象
      const date = new Date(milliseconds);
      // 返回日期和时间字符串
      const timestring = date.toLocaleTimeString("en-US", { hour12: false });

      return timestring;
  };

  var arcdata = { startAngle: Math.PI * -0.3 , endAngle: Math.PI * 0.3 };
  var arcPath = d3.arc()
                  .cornerRadius(7)
                  .innerRadius(35)
                  .outerRadius(55);
  var arcPathSmall = d3.arc()
                       .cornerRadius(7)
                       .innerRadius(20)
                       .outerRadius(35);


  var triangle = d3.symbol()
                   .type(d3.symbolTriangle)
                   .size(30);


//所有事件的细节模板
    function DrawDetailScence(dataset){
      const tipytool = d3.select('body')
                        .append('div')
                        .attr('background','white')
                        .style('position','absolute')
                        .style('opacity',0);

//时间段比例尺
      var scale = d3.scaleLinear()
                    .domain([0,d3.max(dataset.map(item => {
                        return item.duration
                     }))])
                    .range([-0.3,0.3]);
//次数比例尺
      var countscale =d3.scaleLinear()
                        .domain([0,d3.max(dataset.map(item => {
                              return item.count
                           }))])
                        .range([-0.3,0.3]);
//最大速度比例尺
      var MaxVscale =d3.scaleLinear()
                        .domain([0,d3.max(dataset.map(item => {
                              return item.mean_velo
                           }))])
                        .range([-0.3,0.3]);
//加速度比例尺
      var Ascale =d3.scaleLinear()
                        .domain([0,d3.max(dataset.map(item => {
                              return item.acceleration
                           }))])
                        .range([-0.3,0.3]);
//速度比例尺
      var vscale = d3.scaleLinear()
                     .domain([0,d3.max(dataset.map(item => {
                        if (item.velocity==0) {
                              return 0.01;
                        }
                        else{
                              return item.velocity;
                        }
      
                     }))])
                     .range([-0.3,0.3]);
        //将时间段数据转换为弧度点的形式
      function transformDataInfo(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * scale(data) };
      }
      //将次数数据转换为弧度点的形式
      function transformDataInfoCount(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * countscale(data) };
      }
      //将最大速度数据转换为弧度点的形式
      function transformDataInfoMaxV(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * MaxVscale(data) };
      }
      //将加速度数据转换为弧度点的形式
      function transformDataInfoA(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * Ascale(data) };
      }

      function transformDataVelo(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * vscale(data) };
      }

      d3.select('#detailInformation').selectAll('*').remove();
      var arcsvg = d3.select('#detailInformation')
                     .append('svg')
                     .attr('id','arcsvg')
                     .attr('width','100%')
                     .attr("transform","translate(0,10)");
      var padding = (document.getElementById('arcsvg').clientWidth-160)/3;

      //获取最大特征信息和速度
      const maxV = d3.max(dataset.map(item => {
            return item.velocity
         }));
      //获取最大次数
      const maxCount = d3.max(dataset.map(item => {
            return item.count
         }));
      //获取最大速度
      const maxSV = d3.max(dataset.map(item => {
            return item.mean_velo
         }));
      //获取最大加速度
      const maxA = d3.max(dataset.map(item => {
            return item.acceleration
         }));
      //获取最大时间段
      const maxTime = d3.max(dataset.map(item => {
            return item.duration
         }));

//切入切出
     if( scence == 0){
      if (typeof(maxCount) == "undefined"){
            setSpecialContent("切入切出最大次数："+0+"次");
            setVeloContent("最大平均速度："+0+"km/h");
      }
      else{
            setSpecialContent("切入切出最大次数："+maxCount+"次");
            setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      }
    dataset.map((item,index) => {
      arcsvg.append("path")
            .attr("d",arcPath(arcdata))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","white");
     var info =  arcsvg.append("path")
            .attr("d",arcPath(transformDataInfoCount(item.count)))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","#caedc9")
            .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('次数：'+item.count);
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                          info.transition()
                               .duration(200)
                              .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                          .duration(200)
                         .attr("stroke-width","1px");
            });
      arcsvg.append("path")
            .attr("d",arcPathSmall(arcdata))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","white");
      var velo = arcsvg.append("path")
            .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","#fedf86")
            .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                          .duration(200)
                         .attr("stroke-width","1px");
            });
      arcsvg.append("path")
            .attr("d", triangle)
            .attr("stroke", 'black')
            .attr("fill", function(d,i){
                return typecolor[item.type];
            })
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
      arcsvg.append("text")
            .text('次数')
            .attr('font-size','11px')
            .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
      arcsvg.append("text")
            .text('平均速度')
            .attr('font-size','11px')
            .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
      arcsvg.append("text")
            .text('id：')
            .attr('font-size','13px')
            .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
      arcsvg.append("text")
            .text('开始：')
            .attr('font-size','13px')
            .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
      arcsvg.append("text")
            .text('结束：')
            .attr('font-size','13px')
            .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
      arcsvg.append("text")
            .text(item.id)
            .attr('font-size','13px')
            .style('fill',function(d,i){
                  return typecolor[item.type];
              })
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
      arcsvg.append("text")
            .text(converTimestampS(item.start_time/1000000))
            .attr('font-size','13px')
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
      arcsvg.append("text")
            .text(converTimestampS(item.start_time/1000000))
            .attr('font-size','13px')
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");

    var svgS1 = document.getElementById('arcsvg');
    var svgh = svgS1.getBBox();
    svgS1.style.height = svgh.y+svgh.height+20;

//     info.on('mouseover',detailtipyinfo(true,"切入切出次数："))
//         .on('mouseout',detailtipyinfo(false,"切入切出次数："))

//     velo.on('mouseover',detailtipyvelo(true))
//         .on('mouseout',detailtipyvelo(false));
    })

     }
    //停止过久
     else if( scence == 1){
      setSpecialContent("最长持续时间："+maxTime.toFixed(2)+"s");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(item.duration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('时间段：'+item.duration.toFixed(2)+'s');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                          .duration(200)
                         .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
                })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('持续时间')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
      })
     }
     //非机动车异常
     else if( scence == 2){
      setSpecialContent("最长持续时间："+maxTime.toFixed(2)+"s");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(item.duration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('时间段：'+item.duration.toFixed(2)+'s');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                        .duration(200)
                         .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
            })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('持续时间')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4))-40)-50)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
      })
    }
    //超速
    else if( scence == 3){
      setSpecialContent("最大超速速度："+(maxSV*3.6).toFixed(2)+"km/h");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfoMaxV(item.mean_velo)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('最大速度：'+(item.mean_velo*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                   info.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
                 })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('最大速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4))-40)-50)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      })
    }
    //行人异常
    else if( scence == 4){ 
      setSpecialContent("最长持续时间："+ maxTime.toFixed(2)+"s");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(item.duration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('时间段：'+item.duration.toFixed(2)+'s');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
             })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('持续时间')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
      })
    }
    //逆行
    else if( scence == 5){
      setSpecialContent("最长持续时间："+maxTime.toFixed(2)+"s");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(item.duration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('时间段：'+item.duration.toFixed(2)+'s');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
             })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('持续时间')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
      })
    }
    //急减速
    else if( scence == 6){
      setSpecialContent("最大加速度："+(maxA*36*360).toFixed(2)+"km/h^2");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfoA(item.acceleration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('加速度：'+(item.acceleration*36*360).toFixed(2)+'km/h^2');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                        .duration(200)
                        .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
                 })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('加速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
      })
    }
    //急加速
    else if( scence == 7){
      setSpecialContent("最大加速度："+(maxA*36*360).toFixed(2)+"km/h^2");
      setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
      dataset.map((item,index) => {
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfoA(item.acceleration)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('加速度：'+(item.acceleration*36*360).toFixed(2)+'km/h^2');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  info.transition()
                          .duration(200)
                          .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  info.transition()
                          .duration(200)
                          .attr("stroke-width","1px");

            });
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86")
              .on('mouseover',function(event){
                  var svgContainer = d3.select("#detailInformation").node();
                  var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                  var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                  tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                  tipytool.style("left", xOffset+ "px")
                          .style("top", yOffset + "px")
                          .transition()
                          .duration(200)
                          .style('opacity',0.9);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","2px");
              })
            .on('mouseout',function(){
                  tipytool.transition()
                          .duration(200)
                          .style('opacity',0);
                  velo.transition()
                      .duration(200)
                      .attr("stroke-width","1px");
            });
        arcsvg.append("path")
              .attr("d", triangle)
              .attr("stroke", 'black')
              .attr("fill", function(d,i){
                return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
        arcsvg.append("text")
              .text('加速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
        arcsvg.append("text")
              .text('平均速度')
              .attr('font-size','11px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
        arcsvg.append("text")
              .text('id：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text('开始：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
        arcsvg.append("text")
              .text('结束：')
              .attr('font-size','13px')
              .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
        arcsvg.append("text")
              .text(item.id)
              .attr('font-size','13px')
              .style('fill',function(d,i){
                  return typecolor[item.type];
              })
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestampS(item.end_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      })
    }
        //占用非机动车道
        else if( scence == 8){
            setSpecialContent("最长持续时间："+maxTime.toFixed(2)+"s");
            setVeloContent("最大平均速度："+(maxV*3.6).toFixed(2)+"km/h");
            dataset.map((item,index) => {
              arcsvg.append("path")
                    .attr("d",arcPath(arcdata))	
                    .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
                    .attr("stroke","black")
                    .attr("stroke-width","1px")
                    .attr("fill","white");
             var info =  arcsvg.append("path")
                    .attr("d",arcPath(transformDataInfo(item.duration)))	
                    .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
                    .attr("stroke","black")
                    .attr("stroke-width","1px")
                    .attr("fill","#bae1f2")
                    .on('mouseover',function(event){
                        var svgContainer = d3.select("#detailInformation").node();
                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                        tipytool.html('时间段：'+item.duration.toFixed(2)+'s');
                        tipytool.style("left", xOffset+ "px")
                                .style("top", yOffset + "px")
                                .transition()
                                .duration(200)
                                .style('opacity',0.9);
                        info.transition()
                            .duration(200)
                            .attr("stroke-width","2px");
                    })
                  .on('mouseout',function(){
                        tipytool.transition()
                                .duration(200)
                                .style('opacity',0);
                        info.transition()
                            .duration(200)
                            .attr("stroke-width","1px");
                  });
              arcsvg.append("path")
                    .attr("d",arcPathSmall(arcdata))	
                    .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
                    .attr("stroke","black")
                    .attr("stroke-width","1px")
                    .attr("fill","white");
              var velo = arcsvg.append("path")
                    .attr("d",arcPathSmall(transformDataVelo(item.velocity)))	
                    .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
                    .attr("stroke","black")
                    .attr("stroke-width","1px")
                    .attr("fill","#fedf86")
                    .on('mouseover',function(event){
                        var svgContainer = d3.select("#detailInformation").node();
                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                        tipytool.html('速度：'+(item.velocity*3.6).toFixed(2)+'km/h');
                        tipytool.style("left", xOffset+ "px")
                                .style("top", yOffset + "px")
                                .transition()
                                .duration(200)
                                .style('opacity',0.9);
                        velo.transition()
                            .duration(200)
                            .attr("stroke-width","2px");
                    })
                  .on('mouseout',function(){
                        tipytool.transition()
                                .duration(200)
                                .style('opacity',0);
                        velo.transition()
                              .duration(200)
                              .attr("stroke-width","1px");
                  });
              arcsvg.append("path")
                    .attr("d", triangle)
                    .attr("stroke", 'black')
                    .attr("fill", function(d,i){
                      return typecolor[item.type];
                   })
                    .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+") rotate(180)");
              arcsvg.append("text")
                    .text('持续时间')
                    .attr('font-size','11px')
                    .attr("transform","translate("+(10)+','+((100*parseInt((index/4)+1)+70*parseInt((index/4)))-50-40)+")");
              arcsvg.append("text")
                    .text('平均速度')
                    .attr('font-size','11px')
                    .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              arcsvg.append("text")
                    .text('id：')
                    .attr('font-size','13px')
                    .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
              arcsvg.append("text")
                    .text('开始：')
                    .attr('font-size','13px')
                    .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");      
              arcsvg.append("text")
                    .text('结束：')
                    .attr('font-size','13px')
                    .attr("transform","translate("+(10)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");            
              arcsvg.append("text")
                    .text(item.id)
                    .style('fill',function(d,i){
                        return typecolor[item.type];
                    })
                    .attr('font-size','13px')
                    .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
              arcsvg.append("text")
                    .text(converTimestampS(item.start_time/1000000))
                    .attr('font-size','13px')
                    .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
              arcsvg.append("text")
                    .text(converTimestampS(item.end_time/1000000))
                    .attr('font-size','13px')
                    .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+55)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
        
            var svgS1 = document.getElementById('arcsvg');
            var svgh = svgS1.getBBox();
            svgS1.style.height = svgh.y+svgh.height+20;
            })
          }
    }

    useEffect(() => {
       // console.log(carNum,time,scence)
      detail_item(time,carNum,scence).then(res => {
        var dataDetail = res;
        setCarName(name[carNum]);
        DrawDetailScence(dataDetail);
      })

    },[carNum,time,scence])
    


    return (
      <div style={{position:'relative'}}>
       
        <div className = 'detail' style={{height:'470px',width:'100%',position:'absolute',background:'#efefef'}}> 
        <div style={{height:'20%',width:'99.8%',background:'#edede8',borderRadius:'20px',border:'5px solid #cccccc'}}>
        <div style={{textAlign:'center'}}>
         <p>
        <text style={{color:'#5c677d'}}><b>小型车辆</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#79addc'}}><b>行人</b> &nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#f19c79'}}><b>非机动车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#f4d35e'}}><b>卡车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#709775'}}><b>客车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#ce4257'}}><b>手推车</b> </text>
        </p>
        <p id = 'information' style={{lineHeight:'180%',textAlign:'center'}}>在<b>{converTimestampall(time)}</b>所在5分钟内,<b>{carname}</b>的<b>{label[scence]}</b>场景详细信息如下：</p>
        <div id = 'information' style={{lineHeight:'180%',textAlign:'center'}}>{specialContent},&nbsp;&nbsp;&nbsp;{veloContent}</div>
        </div>
        </div>
        <div id = 'detailInformation' style={{height:'80%',width:'100%',overflowY:'auto',position:'relative'}}>
                          {/* 提示框
         {tipyFlag ? <div className ="tip" id="flow_tip" 
        style={{width:"150px",height:"25px",position:'absolute',top:tipyY,left:tipyX,background:'rgba(161,161,161,0.6)',textAlign:'center'}}>
            {tipyContent}
            </div> : null } */}
        </div>
        </div>
        </div>
    );
}
export default Details;