// import React from 'react';
// import * as d3 from 'd3';
// import { useEffect,useState } from 'react';

// function Flow(){
//     function drawChord(){
//         const height = document.getElementById('flowContainer').clientHeight;
//         const width = document.getElementById('flowContainer').clientWidth;
//         const point = [[width*1/12,height*4/12],[width*1/12,height*8/12],[width*4/12,height*11/12],[width*8/12,height*11/12],[width*11/12,height*8/12],[width*11/12,height*4/12],[width*8/12,height*1/12],[width*4/12,height*1/12]];
//         const controlPoint = [[width*4/12,height*4/12],[width*4/12,height*8/12],[width*8/12,height*8/12],[width*8/12,height*4/12],[width*6/12,height*6/12]];
//         console.log(point);
//         var svg = d3.select('#flowContainer').append('svg').attr('width',width+50).attr('height',height+50);
//         svg.selectAll('circle')
//         .data(point)
//         .enter()
//         .append('circle')
//         .attr('cx',function(d){
//          return d[0];
//         })
//         .attr('cy',function(d){
//          return d[1];
//         })
//         .attr('r',function(d){
//          return 5;
//         })
//         .attr('fill','grey');

//         svg.append('g')
//         .selectAll('circle')
//         .data(controlPoint)
//         .enter()
//         .append('circle')
//         .attr('cx',function(d){
//          return d[0];
//         })
//         .attr('cy',function(d){
//          return d[1];
//         })
//         .attr('r',function(d){
//          return 5;
//         })
//         .attr('fill','red');

//        var path = d3.path();
//     //    path.moveTo(point[0][0],point[0][1]);
//     //    path.quadraticCurveTo(controlPoint[0][0],controlPoint[0][1],point[7][0],point[7][1]);
       
//     //    svg.append('path')
//     //        .attr('d', path.toString())
//     //        .style('fill','none')
//     //        .style('stroke','red')
//     //        .style('stroke-width','0.1');  
//     //        path.moveTo(point[0][0],point[0][1]);
//     //        path.quadraticCurveTo(controlPoint[0][0]+1,controlPoint[0][1]+1,point[7][0],point[7][1]);
//     //        svg.append('path')
//     //        .attr('d', path.toString())
//     //        .style('fill','none')
//     //        .style('stroke','red')
//     //        .style('stroke-width','0.1');  
//     let  line = d3.line() .curve(d3.curveMonotoneY);
//         var population = [
//                             [ 10,  305 , 456 , 123  ],
//                             [ 324,  200 , 260 , 12   ],
//                             [ 871,  645 , 300 , 845  ],
//                             [ 321,  167 , 314 , 400  ]
//                         ];
//         for(var i=1;i<=4;i++){
//             for(var j=0;j<population[0][i-1];j++){
//                 path.moveTo(point[0][0],point[0][1]+j);
//                 // if(i%2==0){
//                 //     path.quadraticCurveTo(point[2*i-1][0]+j,point[0][1],point[2*i-1][0]+j,point[2*i-1][1]);
//                 // }
//                 // else{
//                 //    // path.quadraticCurveTo(point[2*i-1][0]+j,point[0][1],point[2*i-1][0],point[2*i-1][1]);
//                 // }
//                 path.quadraticCurveTo(point[2*i-1][0]+j,point[0][1],point[2*i-1][0]+j,point[2*i-1][1]);
                
//                 svg.append('path')
//                     .attr('d', path.toString())
//                     .style('fill','none')
//                     .style('stroke','red')
//                     .style('stroke-width','0.5');  
//             }

//         }
        
//     }
    
//     useEffect(()=>{
//         drawChord()
//     },[])

    
//     return(
//         <div id ='flowContainer' style={{width:'100%',height:'100%'}}>

//         </div>
//     );
// }
// export default Flow;