import React from "react";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { getLittleRoadFlow } from "../../apis/api";

function ChordFlow(props) {
  const { timeStamp } = props;
  const [tipyFlag, setTipyFlag] = useState(false);
  const [tipyContent, setTipyContent] = useState("");
  const [tipyX, setTipyX] = useState("0px");
  const [tipyY, setTipyY] = useState("0px");
  //const [timeFlag,SetTimeFlag] = useState(1681315196);
  const [temp, setTemp] = useState(20);
  // console.log(timeStamp);
  var colorarray = [
    "rgb(34, 148, 83)",
    "rgb(217,164, 14)",
    "rgb(34, 162, 195)",
    "rgb(222, 118, 34)",
  ];
  //var colorarray = ['green','green','green','green','green','green','green','green','green','blue','blue','blue','blue','blue','blue','blue','blue','orange','orange','orange','orange','orange','orange','orange','orange','orange','red','red','red','red','red','red','red'];
  // var color20 = d3.scaleOrdinal(colorarray);
  var color20 = d3.scaleOrdinal().domain([0, 32]).range(colorarray);

  function drawChord(flow) {
    var width = document.getElementById("flowContainer").clientWidth;
    var height = document.getElementById("flowContainer").clientHeight;
    var TrafficFlow = d3
      .select("#flow_div")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("id", "traffic_flow")
      .attr(
        "transform",
        "translate(" + (width / 2 - 2) + "," + (height / 2 + 2) + ")"
      );

    //准备数据
    var city_name = [];
    for (var i = 0; i < 32; i++) {
      city_name.push(i);
    }

    // 弦布局
    var chord_layout = d3
      .chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)(flow);
    // console.log(flow);

    // 布局转化数据
    var groups = chord_layout.groups;
    //var chords = chord_layout.chords;
    //var color20 = d3.scale.category20();
    // var color20 = d3.scaleOrdinal(d3.schemeCategory10);
    //绘制节点弧
    // 弧生成器
    var innerRadius = (width / 2) * 0.8;
    var outerRadius = innerRadius * 1.05;
    var outer_arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    // 绘制节点
    var g_outer = TrafficFlow.append("g");
    g_outer
      .selectAll("path")
      .data(groups)
      .enter()
      .append("path")
      .style("fill", function (d) {
        return color20(d.index);
      })
      .style("stroke", function (d) {
        color20(d.index);
      })
      .attr("d", outer_arc); // 此处调用了弧生成器

    // 节点文字
    // g_outer.selectAll("text")
    //     .data(groups)
    //     .enter()
    //     .append("text")
    //     .each(function(d,i) {   // 对每个绑定的数据添加两个变量
    //         d.angle = (d.startAngle +d.endAngle) / 2;
    //         d.name = city_name[i];
    //     })
    //     .attr("dy",".35em")
    //     .attr('transform', function(d) {    // 平移属性
    //         var result =  "rotate(" +(d.angle*180/Math.PI) + ")";
    //         result += "translate(0," + -1 * (outerRadius + 10) + ")";
    //         // if (d.angle > Math.PI * 3 / 4 && d.angle < Math.PI * 5 / 4 )
    //         //     result += "rotate(180)";
    //         return result;
    //     })
    //     .text(function(d) {
    //         return d.name;
    //     });
    //绘制连线弦
    // 弦生成器
    var inner_chord = d3.ribbon().radius(innerRadius);

    //console.log(inner_chord);
    //console.log(chord_layout)
    // let scale = d3.scaleLinear()
    //              .domain([0,8761])
    //              .range([0.2,0.7]);
    // 绘制内部弦
    var g_inner = TrafficFlow.append("g").attr("class", "chord");
    g_inner
      .selectAll("path")
      .data(chord_layout)
      .enter()
      .append("path")
      .attr("d", inner_chord) // 调用弦的路径值
      .style("fill", function (d) {
        return color20(d.source.index);
      })
      .style("opacity", 0.5);

    g_outer
      .selectAll("path")
      .on("mouseover", fade(0)) // 0.0完全透明
      .on("mouseout", fade(0.5)); // 1.0完全不透明

    g_inner
      .selectAll("path")
      .on("mouseover", innertipy(true))
      .on("mouseout", innertipy(false));

    //交互操作，鼠标移到该节点只会显示与节点相接的弦，其他弦会被隐藏
    function fade(opacity) {
      return function (g, i) {
        // console.log(g,i);
        g_inner
          .selectAll("path")
          .filter(function (d) {
            return d.source.index != i.index && d.target.index != i.index;
          })
          .transition()
          .style("opacity", opacity);
      };
    }
    function innertipy(flag) {
      if (flag == true) {
        return function (g, i) {
          //console.log(g);
          setTipyFlag(flag);
          if (i.source.index != i.target.index) {
            //console.log("出："+i.source.value+"进："+i.target.value);
            setTipyContent("出：" + i.source.value);
            setTipyX(g.pageX + "px");
            setTipyY(g.pageY + "px");
          } else {
            setTipyFlag(flag);
            setTipyContent("掉头:" + i.source.value);
            setTipyX(g.pageX + "px");
            setTipyY(g.pageY + "px");
          }
        };
      } else
        return function () {
          setTipyFlag(flag);
        };
    }
  }
  //每5分钟更新弦图
  function updateChord(flow) {
    var TrafficFlow = d3.select("#traffic_flow");
    TrafficFlow.selectAll("*").remove();
    var width = document.getElementById("flowContainer").clientWidth;
    var height = document.getElementById("flowContainer").clientHeight;

    //准备数据

    var city_name = [];
    for (var i = 0; i < 32; i++) {
      city_name.push(i);
    }

    setTemp(temp + 10);

    // 弦布局
    var chord_layout = d3
      .chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)(flow);

    // 布局转化数据
    var groups = chord_layout.groups;
    //var chords = chord_layout.chords;
    //var color20 = d3.scale.category20();

    //绘制节点弧
    // 弧生成器
    var innerRadius = (width / 2) * 0.8;
    var outerRadius = innerRadius * 1.05;
    var outer_arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    // 绘制节点
    var g_outer = TrafficFlow.append("g");
    g_outer
      .selectAll("path")
      .data(groups)
      .enter()
      .append("path")
      .style("fill", function (d) {
        return color20(d.index);
      })
      .style("stroke", function (d) {
        color20(d.index);
      })
      .attr("d", outer_arc); // 此处调用了弧生成器

    // // 节点文字
    //     g_outer.selectAll("text")
    //         .data(groups)
    //         .enter()
    //         .append("text")
    //         .each(function(d,i) {   // 对每个绑定的数据添加两个变量
    //             d.angle = (d.startAngle +d.endAngle) / 2;
    //             d.name = city_name[i];
    //         })
    //         .attr("dy",".35em")
    //         .attr('transform', function(d) {    // 平移属性
    //             var result =  "rotate(" +(d.angle*180/Math.PI) + ")";
    //             result += "translate(0," + -1 * (outerRadius + 10) + ")";
    //             if (d.angle > Math.PI * 3 / 4 && d.angle < Math.PI * 5 / 4 )
    //                 result += "rotate(180)";
    //             return result;
    //         })
    //         .text(function(d) {
    //             return d.name;
    //         });
    //绘制连线弦
    // 弦生成器
    var inner_chord = d3.ribbon().radius(innerRadius);

    //console.log(inner_chord);
    // console.log(chord_layout)
    // let scale = d3.scaleLinear()
    //              .domain([0,8761])
    //              .range([0.2,0.7]);
    // 绘制内部弦
    var g_inner = TrafficFlow.append("g").attr("class", "chord");
    //console.log(chord_layout);
    g_inner
      .selectAll("path")
      .data(chord_layout)
      .enter()
      .append("path")
      .attr("d", inner_chord) // 调用弦的路径值
      .style("fill", function (d) {
        return color20(d.source.index);
      })
      .transition()
      .duration(1000)
      .style("opacity", 0.5);

    g_outer
      .selectAll("path")
      .on("mouseover", fade(0)) // 0.0完全透明
      .on("mouseout", fade(0.5)); // 1.0完全不透明

    g_inner
      .selectAll("path")
      .on("mouseover", innertipy(true))
      .on("mouseout", innertipy(false));

    g_inner.selectAll("path").on("mousedown", getLittleNum());

    //交互操作，鼠标移到该节点只会显示与节点相接的弦，其他弦会被隐藏
    function fade(opacity) {
      return function (g, i) {
        // console.log(g,i);
        g_inner
          .selectAll("path")
          .filter(function (d) {
            return d.source.index != i.index && d.target.index != i.index;
          })
          .transition()
          .style("opacity", opacity);
      };
    }
    //交互操作，鼠标移动到该节点，可以提示该车道id号和出量
    function innertipy(flag) {
      if (flag == true) {
        return function (g, i) {
          //console.log(g);
          setTipyFlag(flag);
          if (i.source.index != i.target.index) {
            //console.log("出："+i.source.value+"进："+i.target.value);
            setTipyContent(
              "车道id:" + i.source.index + " 出：" + i.source.value
            );
            setTipyX(g.pageX + "px");
            setTipyY(g.pageY + "px");
          } else {
            setTipyFlag(flag);
            setTipyContent("掉头:" + i.source.value);
            setTipyX(g.pageX + "px");
            setTipyY(g.pageY + "px");
          }
        };
      } else
        return function () {
          setTipyFlag(flag);
        };
    }
    //交互操作，点击获取小车道号
    function getLittleNum() {
      return function (g, i) {
        console.log(i.source.index);
      };
    }
  }

  //用于控制弦图更新
  const [update, setUpdate] = useState(timeStamp);
  useEffect(() => {
    // console.log(1)
    getLittleRoadFlow(timeStamp).then((res) => {
      let flow = res;
      drawChord(flow);
      setUpdate(timeStamp);
    });
  }, []);

  //主视图时间戳改变导致更新得时间点改变
  useEffect(() => {
    console.log(timeStamp);
    setUpdate(timeStamp);
    getLittleRoadFlow(timeStamp).then((res) => {
      let flow = res;
      updateChord(flow);
    });
  }, [timeStamp]);

  //   const timerRef = useRef(null); //防止重复创建
  //   const [loading, setLoading] = useState(false); //类似节流的操作，防止并发请求

  //每过5分钟update更新一次为后五分钟的时间戳
  // useEffect(() => {
  //     // console.log('update');
  //     // //定时器每5分钟执行一次
  //     // let timer = setInterval(() => {
  //     //     getLittleRoadFlow(update).then(res => {
  //     //         let flow = res;
  //     //         updateChord(flow);
  //     //        })
  //     //     setUpdate(update+120);
  //     //     // console.log(update);
  //     // },120000)
  //     // return () => {
  //     //     //清理定时器
  //     //     clearInterval(timer);
  //     // }

  //      // 如果定时器已存在，先清理之前的定时器
  //      if (timerRef.current) {
  //         clearInterval(timerRef.current);
  //     }
  //     // 启动定时器
  //     timerRef.current = setInterval(() => {
  //     if (!loading) {
  //         setLoading(true);
  //         getLittleRoadFlow(update).then(res => {
  //             let flow = res;
  //             updateChord(flow);
  //             setLoading(false);
  //         });
  //         setUpdate(prevUpdate => prevUpdate + 120);
  //     }
  //     }, 120000);  // 每 120000ms 更新一次

  //     // 清理定时器
  //     return () => {
  //         clearInterval(timerRef.current);
  //     };
  // },[update])

  //利用requestAnimationFrame优化，和主视图刷新率保持一致
  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0); //为了第一次函数调用就立即触发
  useEffect(() => {
    const updateChordData = () => {
      getLittleRoadFlow(update).then((res) => {
        let flow = res;
        updateChord(flow);
      });
    };

    const animate = () => {
      const currentTime = performance.now();
      if (currentTime - lastUpdateTimeRef.current >= 120000) {
        updateChordData();
        lastUpdateTimeRef.current = currentTime;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 清理操作
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        id="flowContainer"
        style={{
          left: "0%",
          top: "5%",
          width: 200,
          height: 200,
          position: "absolute",
          background: "white",
          borderRadius: "50%",
          opacity: 0.5,
        }}
      >
        <div
          id="flow_div"
          style={{
            transform: [`rotateZ(-90deg) rotateY(180deg)`],
            background: "white",
            borderRadius: "50%",
          }}
        ></div>
      </div>

      {/* 提示框 */}
      {tipyFlag ? (
        <div
          className="tip"
          id="flow_tip"
          style={{
            width: "150px",
            height: "25px",
            position: "absolute",
            top: tipyY,
            left: tipyX,
            background: "rgba(255,255,255,0.3)",
            textAlign: "center",
          }}
        >
          {tipyContent}
        </div>
      ) : null}
    </>
  );
}

export default ChordFlow;
