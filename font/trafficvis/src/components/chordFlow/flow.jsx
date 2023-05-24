import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState } from 'react';

function Flow(){
    function drawChord(){
        const height = document.getElementById('flowContainer').clientHeight;
        const width = document.getElementById('flowContainer').clientWidth;
        const point = [[width*1/5,height*2/5],[width*1/5,height*3/5],[width*2/5,height*4/5],[width*3/5,height*4/5],[width*4/5,height*2/5],[width*4/5,height*3/5],[width*2/5,height*1/5],[width*3/5,height*1/5]];
        const controlPoint = [[width*2/5,height*2/5],[width*2/5,height*3/5],[width*3/5,height*2/5],[width*3/5,height*3/5]];
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

        svg.append('g')
        .selectAll('circle')
        .data(controlPoint)
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
        .attr('fill','red');

       var path = d3.path();
       path.moveTo(point[0][0],point[0][1]);
       path.quadraticCurveTo(controlPoint[0][0],controlPoint[0][1],point[6][0],point[6][1]);
       
       svg.append('path')
           .attr('d', path.toString())
           .style('fill','none')
           .style('stroke','red')
           .style('stroke-width','0.5');  
           path.moveTo(point[0][0],point[0][1]);
           path.quadraticCurveTo(controlPoint[0][0]+5,controlPoint[0][1]+5,point[6][0],point[6][1]);
           svg.append('path')
           .attr('d', path.toString())
           .style('fill','none')
           .style('stroke','red')
           .style('stroke-width','0.5');  

        var population = [
                            [ 1000,  3045 , 4567 , 1234  ],
                            [ 3214,  2000 , 2060 , 124   ],
                            [ 8761,  6545 , 3000 , 8045  ],
                            [ 3211,  1067 , 3214 , 4000  ]
                        ];
        
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