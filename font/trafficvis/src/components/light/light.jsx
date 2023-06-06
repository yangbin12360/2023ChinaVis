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
        // var lightData = [
        //     [10, 0, 7, 8, 3, 2,6],//该斑马对应下部分马路上的异常事件统计
        //     [12,8,10,15,8,12,5],//行人过马路平均速度——绿（速度越大，绿灯越小）
        //     [3,30,25,23,30,13,14]//行人过马路流量——红（人流量越大，红灯越大）

        // ];
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
                    .attr('height', height)
                    .attr('transform','translate('+ left+')');

        var Scence = svg.append('g').attr('id','Scence');
       
        //矩形条的高度标尺
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(lightData[0])])
            .range([2*barWidth+30, height -top]);
        
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
            .attr('height', d => yScale(d))
            .attr('width', barWidth - barPadding)
            .attr('transform', (d, i) => {
            var translate = [ barWidth * i, 0 ]
            return 'translate(' + translate + ')'
            })
            .attr('stroke','black')
            .attr('fill', '#e8e8e4');

        var text = Scence.selectAll('text')
            .data(lightData[0])
            .enter()
            .append('text')
            .text(d => d)
            .attr('y', (d, i) => height - yScale(d) - 2)
            .attr('x', (d, i) => barWidth * i+(barWidth-barPadding)/4)
            .attr('fill', '#000000');
        
        var greenLight = svg.append('g').attr('id','greenLight');

        var greenCircle = greenLight.selectAll('circle')
                                    .data(lightData[1])
                                    .enter()
                                    .append('circle')
                                    .attr('cx',function(d,i){
                                        return barWidth*i+barWidth/2-2.5;
                                    })
                                    .attr('cy',function(d,i){
                                        return (height-(yScale(lightData[0][i])/3));
                                    })
                                    .attr('r',function(d,i){
                                        return GrScale(d);
                                    })
                                    .attr('fill','#e8e8e4')
                                    .on('mouseover',function(event,d){
                                        var svgContainer = d3.select("#lightContainer").node();
                                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                                        tipytool.html("速度："+d.toFixed(2)+"m/s");
                                        tipytool.style("left", xOffset+ "px")
                                                .style("top", yOffset + "px")
                                                .transition()
                                                .duration(200)
                                                .style('opacity',0.9);
                                    })
                                    .on('mouseout',function(){
                                        tipytool.transition()
                                        .duration(200)
                                        .style('opacity',0);});

                                    
        var redLight = svg.append('g').attr('id','redLight');

        var redCircle = redLight.selectAll('circle')
                                .data(lightData[2])
                                .enter()
                                .append('circle')
                                .attr('cx',function(d,i){
                                    return barWidth*i+barWidth/2-2.5;
                                })
                                .attr('cy',function(d,i){
                                    return (height-(yScale(lightData[0][i])*2/3));
                                })
                                .attr('r',function(d,i){
                                    return RrScale(d);
                                })
                                .attr('fill','#de7266')
                                .on('mouseover',function(event,d){
                                    var svgContainer = d3.select("#lightContainer").node();
                                    var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                    var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                                    tipytool.html("人流量："+d.toFixed(2));
                                    tipytool.style("left", xOffset+ "px")
                                            .style("top", yOffset + "px")
                                            .transition()
                                            .duration(200)
                                            .style('opacity',0.9);
                                })
                                .on('mouseout',function(){
                                    tipytool.transition()
                                    .duration(200)
                                    .style('opacity',0);});


    }

    function updateLight(lightData){
        const tipytool = d3.select('body')
                            .append('div')
                            .attr('background','white')
                            .style('position','absolute')
                            .style('opacity',0);
        var left = 20;
        var top = 20;
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

        var Scence = svg.append('g').attr('id','Scence');
       
        //矩形条的高度标尺
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(lightData[0])])
            .range([2*barWidth+30, height -top]);
        
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
            var translate = [ barWidth * i, 0 ]
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
            .attr('fill', '#000000');
        
        var greenLight = svg.append('g').attr('id','greenLight');

        var greenCircle = greenLight.selectAll('circle')
                                    .data(lightData[1])
                                    .enter()
                                    .append('circle')
                                    .attr('cy',function(d,i){
                                        return (height-(yScale(lightData[0][i])/3));
                                    })
                                    .attr('cx',function(d,i){
                                        return barWidth*i+barWidth/2-2.5;
                                    })
                                    .on('mouseover',function(event,d){
                                        var svgContainer = d3.select("#lightContainer").node();
                                        var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                        var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
                                        tipytool.html("速度："+d.toFixed(2)+"m/s");
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
                                    return (height-(yScale(lightData[0][i])*2/3));
                                })
                                .attr('cx',function(d,i){
                                    return barWidth*i+barWidth/2-2.5;
                                })
                                .on('mouseover',function(event,d){
                                    var svgContainer = d3.select("#lightContainer").node();
                                    var xOffset = window.scrollX + svgContainer.getBoundingClientRect().left + d3.pointer(event, svgContainer)[0] + 10;
                                    var yOffset = window.scrollY + svgContainer.getBoundingClientRect().top + d3.pointer(event, svgContainer)[1] + 10;
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