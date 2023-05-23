import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState } from 'react';
import { svg } from 'd3';

function RelationshipScene (){

    function drawRelationPlot(){
    //假数据
    var data24 = [
    {aid:0,num:[0,0,1,0],time:1},{aid:2,num:[2,5,1,1],time:4},{aid:5,num:[2,0,1,0],time:24},{aid:3,num:[1,0,3,0],time:24},{aid:6,num:[0,2,1,0],time:24},{aid:7,num:[0,8,1,0],time:24},{aid:6,num:[0,1,1,1],time:23}
    ];
    const action = ['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'];
    const colorchoose = ['blue','green','orange','red'];

    let width = document.getElementById('relationContainer').clientWidth-10;
    let height= document.getElementById('relationContainer').clientHeight-10;
    let padding_left=70
    let padding_top=20
    //创建画布
    let svg = d3.select('#relationContainer')
                .append('svg')
                .attr('width',width+padding_left)
                .attr('height',height+padding_top);
    //x轴标尺
    let xScale = d3.scaleLinear()
                    .domain([0,24])
                    .range([padding_left,width-padding_left/4]);
    //y轴标尺
    let yScale = d3.scaleBand()
                    .domain(['切入切出','停止过久','非机动车异常','超速','行人异常','逆行','急减速','急加速'])
                    .range([0,height-2*padding_top]);
    const minpadding = () => {
        if((xScale(1)-xScale(0))/2<yScale.bandwidth()/2){
            return (xScale(1)-xScale(0))/2;
        }
        else {
            return yScale.bandwidth()/2;
        }
    }
    //圆点半径标尺
    let rScale = d3.scaleLinear()
                   .domain([0,d3.max(data24,function(d){
                        return eval(d.num.join("+"));
                   })])
                   .range([0,minpadding()-10]);
    //x坐标轴
    let xAxis=d3.axisBottom()
                .scale(xScale)
                .ticks(25);  
    //y坐标轴
    let yAxis=d3.axisLeft()
                .scale(yScale)
                .ticks(9);
    //把坐标轴添加到画布中
    svg.append('g')
       .attr('class','axis')
       .attr("transform","translate("+0+","+(height-padding_top)+")")
       .call(xAxis);
    svg.append('g')
       .attr('class','axis')
       .attr("transform","translate("+padding_left+","+padding_top+")")
       .call(yAxis);
    //添加x轴坐标名称
    svg.append("text")
       .attr("transform", "translate(" +(width-padding_left/2) + "," + (height+padding_top/2)+ ")")
       .style("text-anchor", "middle")
       .text("时间/h");
    //添加y轴坐标名称
    svg.append("text")
       .attr("transform", "translate(" + padding_left/2 + "," + padding_top+ ")")
       .style("text-anchor", "middle")
       .text("高价值场景");

    //画点和饼图圆弧
    //车道分布圆弧
    var pieSvg = svg.append('g');
    var pie=d3.pie()
              .value(function(d){return d;});
              
    
    data24.forEach(function(value,index){
        var arc=d3.arc()
              .innerRadius(rScale(value.num[0]+value.num[1]+value.num[2]+value.num[3])+2)
              .outerRadius(rScale(value.num[0]+value.num[1]+value.num[2]+value.num[3])+5);
        var piedata = pie(value.num);
        console.log(piedata);
        pieSvg.append('g')
              .selectAll('path')
              .data(piedata)
              .enter()
              .append("path")
              .attr("d",function(d){
                  return arc(d);
              })
              .attr("fill",function(d,i){
                  return colorchoose[i];
              })
             .attr("transform","translate("+xScale(value.time)+","+(yScale(action[value.aid])+2*padding_top)+")");
    })
    
    
    svg.selectAll('circle')
       .data(data24)
       .enter()
       .append('circle')
       .attr('cx',function(d){
        return xScale(d.time);
       })
       .attr('cy',function(d){
        console.log(action[d.aid]);
        return yScale(action[d.aid])+2*padding_top;
       })
       .attr('r',function(d){
        //return 1;
        return rScale(d.num[0]+d.num[1]+d.num[2]+d.num[3])
       })
       .attr('fill','grey');
    
    }


    

    useEffect(() => {
        drawRelationPlot();
    },[])

    return (
        <div id='relationContainer' style={{width:'100%',height:'100%'}}></div>
    ) 
    
}

export default RelationshipScene;