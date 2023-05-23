import React from 'react';
import * as d3 from 'd3';
import { useEffect,useState } from 'react';
import './chordFlow.css'

function ChordFlow(){
    const [tipyFlag,setTipyFlag] = useState(false);
    const [tipyContent,setTipyContent] = useState("");
    const [tipyX,setTipyX] = useState('0px');
    const [tipyY,setTipyY] = useState('0px');
    function drawChord(){
        var width = document.getElementById('flowContainer').clientWidth-20;
        var height = document.getElementById('flowContainer').clientHeight-20;
        console.log(height);
        var TrafficFlow = d3.select('#flow_div')
                            .append('svg')
                            .attr('width',width+20)
                            .attr('height',height+20)
                            .append("g")
                            .attr('id','traffic_flow')
                            .attr('transform', 'translate(' + width/2 + "," + height/2 + ")");
    
        //准备数据
        var city_name = [ "车道1" , "车道2" , "车道3" , "车道4"  ];
        var population = [
                [ 1000,  3045 , 4567 , 1234  ],
                [ 3214,  2000 , 2060 , 124   ],
                [ 8761,  6545 , 3000 , 8045  ],
                [ 3211,  1067 , 3214 , 4000  ]
            ];
        // 弦布局
        var chord_layout = d3.chord() 
        .padAngle(0.2)  
        .sortSubgroups(d3.descending) 
        .sortChords(d3.descending) 
        (population); 

        // 布局转化数据
        var groups = chord_layout.groups;
        //var chords = chord_layout.chords;
        //var color20 = d3.scale.category20();
        var color20 = d3.scaleOrdinal(d3.schemeCategory10);
        //绘制节点弧
        // 弧生成器
        var innerRadius = width/2 * 0.7;
        var outerRadius = innerRadius * 1.1;
        var outer_arc = d3.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);
    // 绘制节点
        var g_outer = TrafficFlow.append("g");
        g_outer.selectAll("path")
            .data(groups)
            .enter()
            .append("path")
            .style("fill",function(d) {
                return color20(d.index);
            })
            .style("stroke",function(d) {
                color20(d.index);
            })
            .attr("d",outer_arc)   // 此处调用了弧生成器
            ;
    // 节点文字
        g_outer.selectAll("text")
            .data(groups)
            .enter()
            .append("text")
            .each(function(d,i) {   // 对每个绑定的数据添加两个变量
                d.angle = (d.startAngle +d.endAngle) / 2;
                d.name = city_name[i];
            })
            .attr("dy",".35em")
            .attr('transform', function(d) {    // 平移属性
                var result =  "rotate(" +(d.angle*180/Math.PI) + ")";
                result += "translate(0," + -1 * (outerRadius + 10) + ")";
                if (d.angle > Math.PI * 3 / 4 && d.angle < Math.PI * 5 / 4 )
                    result += "rotate(180)";
                return result;
            })
            .text(function(d) {
                return d.name;
            });
        //绘制连线弦
        // 弦生成器
        var inner_chord = d3.ribbon()
                        .radius(innerRadius);
    
        console.log(inner_chord);
    
    // 绘制内部弦
        var g_inner = TrafficFlow.append("g")
                        .attr("class","chord");
        console.log(chord_layout);
        g_inner.selectAll("path")
                .data(chord_layout)
                .enter()
                .append("path")
                .attr("d",inner_chord)  // 调用弦的路径值
                .style("fill",function(d) {
                return color20(d.source.index);
                })
                .style("opacity",1);
        
        g_outer.selectAll("path")
            .on("mouseover",fade(0))  // 0.0完全透明
            .on("mouseout",fade(1));   // 1.0完全不透明

        g_inner.selectAll("path")
            .on("mouseover",innertipy(true))
            .on("mouseout",innertipy(false));

        //交互操作，鼠标移到该节点只会显示与节点相接的弦，其他弦会被隐藏
        function fade(opacity){
            return function(g,i){
            // console.log(g,i);
                g_inner.selectAll("path")
                        .filter(function(d) {
                            return d.source.index != i.index && d.target.index != i.index;
                        })
                        .transition()
                        .style("opacity",opacity);
            }
        }
        function innertipy(flag){
            if(flag == true){
                return function(g,i){
                    console.log(g);
                    setTipyFlag(flag);
                    if(i.source.index != i.target.index){
                        console.log("出："+i.source.value+"进："+i.target.value);
                        setTipyContent( "出："+i.source.value+"进："+i.target.value);
                        setTipyX(g.offsetX+'px');
                        console.log(tipyX);
                        setTipyY(g.offsetY+'px');
                    }
                    else{
                        setTipyFlag(flag);
                        console.log("掉头:"+i.source.value);
                        setTipyContent("掉头:"+i.source.value);
                        setTipyX(g.offsetX+'px');
                        setTipyY(g.offsetY+'px');
                    }
    
                }
            }
            else return function(){
                setTipyFlag(flag);
            }
           
        }

    }
    
    
    
    useEffect(() => {
        drawChord();
    },[])

    return (
        <div id ='flowContainer' style={{width:'100%',height:'100%'}}>
        <div id="flow_div" style={{position:'absolute'}}>
        {/* 提示框 */}
        {tipyFlag ? <div className ="tip" id="flow_tip" 
        style={{width:"150px",height:"25px",position:'absolute',top:tipyY,left:tipyX,background:'rgba(161,161,161,0.6)',textAlign:'center'}}>
            {tipyContent}
            </div> : null }

        </div>
         </div>
        );
}

export default ChordFlow;