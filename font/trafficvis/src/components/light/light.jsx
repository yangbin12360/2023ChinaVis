import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState,useRef } from 'react';
import {getCrossWalkData} from "../../apis/api";

function Light(props){
    const {timeStamp} = props;
    const [tipyFlag,setTipyFlag] = useState(false);
    const [tipyContent,setTipyContent] = useState("");
    const [tipyX,setTipyX] = useState('0px');
    const [tipyY,setTipyY] = useState('0px');
    //const [updateTime,setUpdateTime] = useEffect(timeStamp);
    function drawLight(lightData){
        var left = 20;
        var top = 20;
        var width = document.getElementById('lightContainer').clientWidth;
        var height = document.getElementById('lightContainer').clientHeight;
        var barPadding = 5;
        const tipytool = d3.select('body')
                     .append('div')
                     .attr('background','white')
                     .style('position','absolute')
                     .style('opacity',0);

        var barWidth = ( (width-(2*left))/ lightData[0].length);
        console.log(width,barWidth);
        var svg = d3.select('#lightContainer')
                    .append('svg')
                    .attr('id','lightSvg')
                    .attr('width', width)
                    .attr('height', height);
                    // .attr('transform','translate('+ left+')');

 //图例
        var legend = svg.append('g').attr('id','legend');

        legend.append('rect')
              .attr('y',6)
              .attr('x',left)
              .attr('width',10)
              .attr('height',5)
              .attr('stroke','black')
              .attr('fill', '#e8e8e4');
        legend.append('text')
              .text('事件统计')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+12);

        legend.append('circle')
              .attr('cy',8)
              .attr('cx',left+62)
              .attr('r',3)
              .style('fill',"#de7266");
        legend.append('text')
              .text('人流量')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+66);
        
        legend.append('circle')
              .attr('cy',8)
              .attr('cx',left+105)
              .attr('r',3)
              .style('fill',"#84b791");
        legend.append('text')
              .text('通行速度')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+109);

        legend.append('rect')
              .attr('y',6)
              .attr('x',left+160)
              .attr('width',10)
              .attr('height',5)
              .attr('stroke','black')
              .attr('fill', '#cccccc');
        legend.append('text')
              .text('斑马线编号')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+172);

        var Scence = svg.append('g').attr('id','Scence');
       
        //矩形条的高度标尺
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(lightData[0])])
            .range([2*barWidth, height -top]);
        
        //绿灯半径比例尺
        var GrScale = d3.scaleLinear()
                       .domain([d3.min(lightData[1]),d3.max(lightData[1])])
                       .range([barWidth/2-8,3]);
        
        //红灯半斤比例尺
        var RrScale =  d3.scaleLinear()
                         .domain([d3.min(lightData[2]),d3.max(lightData[2])])
                         .range([3,barWidth/2-8]);
        
        var barChart = Scence.selectAll('rect')
            .data(lightData[0])
            .enter()
            .append('rect')
            .attr('y', d =>height - yScale(d))
            .attr('width', barWidth - barPadding)
            .attr('transform', (d, i) => {
            var translate = [ (barWidth * i)+left, 0 ]
            return 'translate(' + translate + ')'
            })
            .attr('stroke','black')
            .attr('fill', '#e8e8e4')
            .transition()
            .duration(500)
            .attr('height', d => yScale(d));
    
        var text = Scence.selectAll('text')
            .data(lightData[0])
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', (d, i) => barWidth * i+(barWidth-barPadding)/4)
            .transition()
            .duration(500)
            .attr('y', (d, i) => height - yScale(d) - 2)
            .attr('transform','translate('+ left+')')
            .attr('fill', '#000000');
        var cross = svg.append('g').attr('id','cross');
        var crossrect = cross.selectAll('rect')
            .data(lightData[0])
            .enter()
            .append('rect')
            .attr('y', d =>height - yScale(0))
            .attr('width', barWidth - barPadding)
            .attr('transform', (d, i) => {
                var translate = [ (barWidth * i)+left, 0 ]
                return 'translate(' + translate + ')'
                })
            .attr('stroke','none')
            .attr('fill', '#cccccc')
            .transition()
            .duration(500)
            .attr('height', d => yScale(d));
         var crosstext = cross.selectAll('text')
            .data(lightData[0])
            .enter()
            .append('text')
            .style('font-size',10)
            .text((d,i) => i)
            .attr('x', (d, i) => barWidth * i+(barWidth-barPadding)/4+2)
            .transition()
            .duration(500)
            .attr('y', height-2)
            .attr('transform','translate('+ left+')')
            .attr('fill', '#000000');
        
        var greenLight = svg.append('g').attr('id','greenLight');

        var greenCircle = greenLight.selectAll('circle')
                                    .data(lightData[1])
                                    .enter()
                                    .append('circle')
                                    .attr('cy',function(d,i){
                                        return (height-(yScale(0)/3));
                                    })
                                    .attr('cx',function(d,i){
                                        return barWidth*i+barWidth/2-2.5;
                                    })
                                    .attr('transform','translate('+ left+')')
                                    .on('mouseover',function(event,d){
                                        var svgContainer = d3.select("#lightContainer").node();
                                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] - 20;
                                        tipytool.html("速度："+(d*3.6).toFixed(2)+"km/h");
                                        tipytool.style("left", xOffset+ "px")
                                                .style("top", yOffset + "px")
                                                .transition()
                                                .duration(200)
                                                .style('opacity',0.9);


                                    })
                                    .on('mouseout',function(){
                                        tipytool.transition()
                                        .duration(200)
                                        .style('opacity',0);
                                    })
                                    .transition()
                                    .duration(500)
                                    .attr('r',function(d,i){
                                        return GrScale(d);
                                    })
                                    .attr('fill','#84b791');
                                    
        var redLight = svg.append('g').attr('id','redLight');

        var redCircle = redLight.selectAll('circle')
                                .data(lightData[2])
                                .enter()
                                .append('circle')
                                .attr('cy',function(d,i){
                                    return (height-(yScale(0)*2/3));
                                })
                                .attr('cx',function(d,i){
                                    return barWidth*i+barWidth/2-2.5;
                                })
                                .attr('transform','translate('+ left+')')
                                .on('mouseover',function(event,d){
                                    var svgContainer = d3.select("#lightContainer").node();
                                    var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                    var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] - 20;
                                    tipytool.html("人流量："+ d.toFixed(2));
                                    tipytool.style("left", xOffset+ "px")
                                            .style("top", yOffset + "px")
                                            .transition()
                                            .duration(200)
                                            .style('opacity',0.9);
                                })
                                .on('mouseout',function(){
                                    tipytool.transition()
                                    .duration(200)
                                    .style('opacity',0);})
                                .transition()
                                .duration(500)
                                .attr('r',function(d,i){
                                    return RrScale(d);
                                })
                                .attr('fill','#de7266');

        svg.append("line")
           .attr("x1", -20)
           .attr("y1", height-yScale(0))
           .attr("x2", width)
           .attr("y2", height-yScale(0))
           .style("stroke", "black")
           .style("stroke-dasharray", ("3, 3"));  


    }

    function updateLight(lightData){
        const tipytool = d3.select('body')
                            .append('div')
                            .attr('background','white')
                            .style('position','absolute')
                            .style('opacity',0);
        var left = 20;
        var top = 30;
        var width = document.getElementById('lightContainer').clientWidth;
        var height = document.getElementById('lightContainer').clientHeight;
        var barPadding = 5;
        // var lightData = [
        //     [10, 0, 7, 8, 3, 2,6],//该斑马对应下部分马路上的异常事件统计
        //     [12,8,10,15,8,12,5],//行人过马路平均速度——绿（速度越大，绿灯越小）
        //     [3,30,25,23,30,13,14]//行人过马路流量——红（人流量越大，红灯越大）

        // ];
        var barWidth = ( (width-(2*left))/ lightData[0].length);
        console.log(width,barWidth);
        var svg = d3.select('#lightSvg');
        svg.selectAll('*').remove();

        //图例
        var legend = svg.append('g').attr('id','legend');

        legend.append('rect')
              .attr('y',6)
              .attr('x',left)
              .attr('width',10)
              .attr('height',5)
              .attr('stroke','black')
              .attr('fill', '#e8e8e4');
        legend.append('text')
              .text('事件统计')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+12);

        legend.append('circle')
              .attr('cy',8)
              .attr('cx',left+62)
              .attr('r',3)
              .style('fill',"#de7266");
        legend.append('text')
              .text('人流量')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+66);
        
        legend.append('circle')
              .attr('cy',8)
              .attr('cx',left+105)
              .attr('r',3)
              .style('fill',"#84b791");
        legend.append('text')
              .text('通行速度')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+109);

        legend.append('rect')
              .attr('y',6)
              .attr('x',left+160)
              .attr('width',10)
              .attr('height',5)
              .attr('stroke','black')
              .attr('fill', '#cccccc');
        legend.append('text')
              .text('斑马线编号')
              .style('font-size',10)
              .attr('y',12)
              .attr('x',left+172);

        var Scence = svg.append('g').attr('id','Scence');
       
        //矩形条的高度标尺
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(lightData[0])])
            .range([2*barWidth, height -top]);
        
        //绿灯半径比例尺
        var GrScale = d3.scaleLinear()
                       .domain([d3.min(lightData[1]),d3.max(lightData[1])])
                       .range([barWidth/2-8,3]);
        
        //红灯半斤比例尺
        var RrScale =  d3.scaleLinear()
                         .domain([d3.min(lightData[2]),d3.max(lightData[2])])
                         .range([3,barWidth/2-8]);
        
        var barChart = Scence.selectAll('rect')
            .data(lightData[0])
            .enter()
            .append('rect')
            .attr('y', d =>height - yScale(d))
            .attr('width', barWidth - barPadding)
            .attr('transform', (d, i) => {
            var translate = [ (barWidth * i)+left, 0 ]
            return 'translate(' + translate + ')'
            })
            .attr('stroke','black')
            .attr('fill', '#e8e8e4')
            .transition()
            .duration(500)
            .attr('height', d => yScale(d));
    
        var text = Scence.selectAll('text')
            .data(lightData[0])
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', (d, i) => barWidth * i+(barWidth-barPadding)/4)
            .transition()
            .duration(500)
            .attr('y', (d, i) => height - yScale(d) - 2)
            .attr('transform','translate('+ left+')')
            .attr('fill', '#000000');
        var cross = svg.append('g').attr('id','cross');
        var crossrect = cross.selectAll('rect')
            .data(lightData[0])
            .enter()
            .append('rect')
            .attr('y', d =>height - yScale(0))
            .attr('width', barWidth - barPadding)
            .attr('transform', (d, i) => {
                var translate = [ (barWidth * i)+left, 0 ]
                return 'translate(' + translate + ')'
                })
            .attr('stroke','none')
            .attr('fill', '#cccccc')
            .transition()
            .duration(500)
            .attr('height', d => yScale(d));
         var crosstext = cross.selectAll('text')
            .data(lightData[0])
            .enter()
            .append('text')
            .style('font-size',10)
            .text((d,i) => i)
            .attr('x', (d, i) => barWidth * i+(barWidth-barPadding)/4+2)
            .transition()
            .duration(500)
            .attr('y', height-2)
            .attr('transform','translate('+ left+')')
            .attr('fill', '#000000');
        
        var greenLight = svg.append('g').attr('id','greenLight');

        var greenCircle = greenLight.selectAll('circle')
                                    .data(lightData[1])
                                    .enter()
                                    .append('circle')
                                    .attr('cy',function(d,i){
                                        return (height-(yScale(0)/3));
                                    })
                                    .attr('cx',function(d,i){
                                        return barWidth*i+barWidth/2-2.5;
                                    })
                                    .attr('transform','translate('+ left+')')
                                    .on('mouseover',function(event,d){
                                        var svgContainer = d3.select("#lightContainer").node();
                                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] - 20;
                                        tipytool.html("速度："+(d*3.6).toFixed(2)+"km/h");
                                        tipytool.style("left", xOffset+ "px")
                                                .style("top", yOffset + "px")
                                                .transition()
                                                .duration(200)
                                                .style('opacity',0.9);


                                    })
                                    .on('mouseout',function(){
                                        tipytool.transition()
                                        .duration(200)
                                        .style('opacity',0);
                                    })
                                    .transition()
                                    .duration(500)
                                    .attr('r',function(d,i){
                                        return GrScale(d);
                                    })
                                    .attr('fill','#84b791');
                                    
        var redLight = svg.append('g').attr('id','redLight');

        var redCircle = redLight.selectAll('circle')
                                .data(lightData[2])
                                .enter()
                                .append('circle')
                                .attr('cy',function(d,i){
                                    return (height-(yScale(0)*2/3));
                                })
                                .attr('cx',function(d,i){
                                    return barWidth*i+barWidth/2-2.5;
                                })
                                .attr('transform','translate('+ left+')')
                                .on('mouseover',function(event,d){
                                    var svgContainer = d3.select("#lightContainer").node();
                                    var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                    var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] - 20;
                                    tipytool.html("人流量："+ d.toFixed(2));
                                    tipytool.style("left", xOffset+ "px")
                                            .style("top", yOffset + "px")
                                            .transition()
                                            .duration(200)
                                            .style('opacity',0.9);
                                })
                                .on('mouseout',function(){
                                    tipytool.transition()
                                    .duration(200)
                                    .style('opacity',0);})
                                .transition()
                                .duration(500)
                                .attr('r',function(d,i){
                                    return RrScale(d);
                                })
                                .attr('fill','#de7266');

        svg.append("line")
           .attr("x1", -20)
           .attr("y1", height-yScale(0))
           .attr("x2", width)
           .attr("y2", height-yScale(0))
           .style("stroke", "black")
           .style("stroke-dasharray", ("3, 3"));  

    }

    useEffect(() => {
        getCrossWalkData(timeStamp).then(res => {
            let lightdata = res;
           // console.log(lightdata);
            drawLight(lightdata);
           })
    },[])

    useEffect(()=>{
        getCrossWalkData(timeStamp).then(res => {
            let lightdata = res;
            //console.log(lightdata);
            updateLight(lightdata);
           })
    },[timeStamp])

    return(
        <div style={{height:'100%',width:'100%',position:'relative'}}>
        <div id = 'lightContainer' style={{height:'100%',width:'100%'} } >
                {/* 提示框
         {tipyFlag ? <div className ="tip" id="flow_tip" 
        style={{width:"30px",height:"25px",position:'absolute',top:tipyY,left:tipyX,background:'rgba(161,161,161,0.6)',textAlign:'center'}}>
            {tipyContent}
            </div> : null } */}

        </div>
        </div>
    );
}
export default Light;