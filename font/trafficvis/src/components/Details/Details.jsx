import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState,useRef } from 'react';
import { svg } from 'd3';
import {getActionAndRoadCount,detail_item} from '../../apis/api'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react';
import { Radio } from "antd";



function Details (props){
    // const [time,setTime] = useState(1681315196);
    // const [carNum,setcarNum] = useState(0);
    // const [scence,setScence] = useState(0);
    const [tipyFlag,setTipyFlag] = useState(false);
    const [tipyContent,setTipyContent] = useState("");
    const [tipyX,setTipyX] = useState('0px');
    const [tipyY,setTipyY] = useState('0px');
    // const [dataset,setDataTese] = useState([]);
    const{time,carNum,scence,handleDetail} = props;

    var name=['车道0','车道1','车道2','车道3','车道4','车道5','车道6','车道7','车道8'];
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


  //鼠标事件展示弧形信息
  function detailtipyinfo(flag,string){
    if(flag == true){
      return function(g,i){
        setTipyFlag(true);
        var value = g.srcElement.attributes.value.value;
        setTipyContent(string+':'+value);
        setTipyX(g.offsetX+'px');
        setTipyY(g.offsetY+'px');
        }
    }
    else {
      return function(g,i){
        setTipyFlag(false);
      }
    }     
}
  //鼠标事件展示弧形信息
  function detailtipyvelo(flag){
    if(flag == true){
      return function(g,i){
        setTipyFlag(true);
        var value = g.srcElement.attributes.value.value;
        setTipyContent("速度："+value);
        setTipyX(g.offsetX+'px');
        setTipyY(g.offsetY+'px');
        }
    }
    else {
      return function(g,i){
        setTipyFlag(false);
      }
    }     
}
//所有事件的细节模板
    function DrawDetailScence(dataset){
      var scale = d3.scaleLinear()
                    .domain([0,4])
      .range([-0.3,0.3]);
      
      var vscale = d3.scaleLinear()
                     .domain([0,4])
                     .range([-0.3,0.3]);
        //将数据转换为弧度点的形式
      function transformDataInfo(data){
        return { startAngle: Math.PI * -0.3 , endAngle: Math.PI * scale(data) };
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

      
//切入切出
     if( scence == 0){
    dataset.map((item,index) => {

      arcsvg.append("path")
            .attr("d",arcPath(arcdata))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","white");
     var info =  arcsvg.append("path")
            .attr("d",arcPath(transformDataInfo(3)))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
            .attr('value',3)
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","#caedc9");
      arcsvg.append("path")
            .attr("d",arcPathSmall(arcdata))	
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","white");
      var velo = arcsvg.append("path")
            .attr("d",arcPathSmall(transformDataVelo(1)))	
            .attr('value',1)
            .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("fill","#fedf86");
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
            .text('速度')
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
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
      arcsvg.append("text")
            .text(converTimestamp(item.start_time/1000000))
            .attr('font-size','13px')
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
      arcsvg.append("text")
            .text(converTimestamp(item.start_time/1000000))
            .attr('font-size','13px')
            .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");

    var svgS1 = document.getElementById('arcsvg');
    var svgh = svgS1.getBBox();
    svgS1.style.height = svgh.y+svgh.height+20;

    info.on('mouseover',detailtipyinfo(true,"切入切出次数："))
        .on('mouseout',detailtipyinfo(false,"切入切出次数："))

    velo.on('mouseover',detailtipyvelo(true))
        .on('mouseout',detailtipyvelo(false));
    })

     }
    //停止过久
     else if( scence == 1){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"持续时间"))
          .on('mouseout',detailtipyinfo(false,"持续时间"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
     }
     //非机动车异常
     else if( scence == 2){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"持续时间"))
          .on('mouseout',detailtipyinfo(false,"持续时间"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    //超速
    else if( scence == 3){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,'最大速度'))
          .on('mouseout',detailtipyinfo(false,'最大速度'));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    //行人异常
    else if( scence == 4){ 
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"持续时间"))
          .on('mouseout',detailtipyinfo(false,"持续时间"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    //逆行
    else if( scence == 5){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#bae1f2");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"持续时间"))
          .on('mouseout',detailtipyinfo(false,"持续时间"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    //急减速
    else if( scence == 6){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"加速度"))
          .on('mouseout',detailtipyinfo(false,"加速度"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    //急加速
    else if( scence == 7){
      dataset.map((item,index) => {
        console.log(index);
        arcsvg.append("path")
              .attr("d",arcPath(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
       var info =  arcsvg.append("path")
              .attr("d",arcPath(transformDataInfo(3)))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+70*parseInt((index/4))-40)+")")
              .attr('value',3)
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#ff9c47");
        arcsvg.append("path")
              .attr("d",arcPathSmall(arcdata))	
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","white");
        var velo = arcsvg.append("path")
              .attr("d",arcPathSmall(transformDataVelo(1)))	
              .attr('value',1)
              .attr("transform","translate("+(80*((index%4)+1)+padding*(index%4)-80*(index%4))+','+(100*parseInt((index/4)+1)+20+70*parseInt((index/4))-40)+")")
              .attr("stroke","black")
              .attr("stroke-width","1px")
              .attr("fill","#fedf86");
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
              .text('速度')
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
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+45)+','+(100*parseInt((index/4)+1)+45+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+65+70*parseInt((index/4))-40)+")");
        arcsvg.append("text")
              .text(converTimestamp(item.start_time/1000000))
              .attr('font-size','13px')
              .attr("transform","translate("+(80*((index%4))+padding*(index%4)-80*(index%4)+65)+','+(100*parseInt((index/4)+1)+85+70*parseInt((index/4))-40)+")");
  
      var svgS1 = document.getElementById('arcsvg');
      var svgh = svgS1.getBBox();
      svgS1.style.height = svgh.y+svgh.height+20;
  
      info.on('mouseover',detailtipyinfo(true,"加速度"))
          .on('mouseout',detailtipyinfo(false,"加速度"));
  
      velo.on('mouseover',detailtipyvelo(true))
          .on('mouseout',detailtipyvelo(false));
      })
    }
    }

    useEffect(() => {
       // console.log(carNum,time,scence)
      detail_item(time,carNum,scence).then(res => {
        var dataDetail = res;
        DrawDetailScence(dataDetail);
      })

    },[carNum,time,scence])
    


    return (
      <div style={{position:'relative'}}>
       
        <div className = 'detail' style={{height:'470px',width:'100%',position:'absolute',background:'#efefef'}}> 
        <div style={{height:'20%' ,background:'#edede8',borderRadius:'20px',border:'5px solid #cccccc'}}>
        <div style={{textAlign:'center'}}>
        <br></br>
        <text style={{color:'#5c677d'}}><b>小型车辆</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#79addc'}}><b>行人</b> &nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#f19c79'}}><b>非机动车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#f4d35e'}}><b>卡车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#709775'}}><b>客车</b>&nbsp;&nbsp;&nbsp;</text>
        <text style={{color:'#ce4257'}}><b>手推车、三轮车</b> </text>
        <br></br>
        <p id = 'information' style={{lineHeight:'180%',textAlign:'center'}}>在<b>{converTimestampall(time)}</b>所在5分钟内,<b>车道{carNum}</b>的<b>{label[scence]}</b>场景详细信息如下：</p>
        </div>
        </div>

        <div id = 'detailInformation' style={{height:'80%',width:'100%',overflowY:'auto',position:'relative'}}>
                          {/* 提示框 */}
         {tipyFlag ? <div className ="tip" id="flow_tip" 
        style={{width:"150px",height:"25px",position:'absolute',top:tipyY,left:tipyX,background:'rgba(161,161,161,0.6)',textAlign:'center'}}>
            {tipyContent}
            </div> : null }
        </div>
        </div>
        </div>
    );
}
export default Details;