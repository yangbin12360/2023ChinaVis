import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState } from 'react';

function Flow(){
    function drawChord(){
        const height = document.getElementById('flowContainer').clientHeight;
        const width = document.getElementById('flowContainer').clientWidth;
        const point = [[width*1/4,height*1/4],[width*3/4,height*1/4],[width*1/4,height*1/4],[width*1/4,height*3/4],[width*1/4,height*3/4],[width*3/4,height*3/4],[width*3/4,height*1/4],[width*3/4,height*3/4]];
        console.log(point);
        var svg = d3.select('#flowContainer').append('svg').attr('width',width+50).attr('height',height+50);
        svg.selectAll('circle')
        .data(point)
        .enter()
        .append('circle')
        .attr('cx',function(d){
         return d[0];
        })
        .attr('cy',function(d){
         return d[1];
        })
        .attr('r',function(d){
         return 5;
        })
        .attr('fill','grey');
        
    }
    
    useEffect(()=>{
        drawChord()
    },[])

    
    return(
        <div id ='flowContainer' style={{width:'100%',height:'100%'}}>

        </div>
    );
}
export default Flow;