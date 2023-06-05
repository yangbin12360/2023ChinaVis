
import * as echarts from "echarts";
import React, { useEffect, useRef, useState } from "react";
import { CLUSTER_LABEL_LIST, CLUSTER_TYPE_LIST } from "../utils/constant";
import { getCluster } from "../../apis/api";
import "./radar.css";
const Radar = (props) =>{
    const {timeStamp} = props
    const radarRef = useRef(null);
    useEffect(() => {
        getCluster(timeStamp).then((res) => {
          let radarData = res["radar"];
          drawRadar(radarData);
        });
      }, [timeStamp]);
    const drawRadar = (radarData) => {
        let existInstance = echarts.getInstanceByDom(radarRef.current);
        if (existInstance !== undefined) {
          echarts.dispose(existInstance);
        }
        const radarChart = echarts.init(radarRef.current);
        const option = {
          legend: {
            data: ["cluster1", "cluster2", "cluster3"],
            textStyle: {
              fontSize: 10, // 将图例字体大小设置为20
            },
          },
    
          radar: {
            radius: "70%",
            shape: "circle",
            center: ["50%", "54%"],
            indicator: [
              { name: "a_std", max: 1 },
              { name: "o_std", max: 2 },
              { name: "distance_mean", max: 100 },
              { name: "v_pca", min: -10, max: 5 },
            ],
          },
          series: [
            {
              type: "radar",
              data: [
                {
                  value: radarData[0][0],
                  name: "cluster1",
                  itemStyle: {
                    color: CLUSTER_LABEL_LIST[0],
                  },
                },
                {
                  value: radarData[0][1],
                  name: "cluster2",
                  itemStyle: {
                    color: CLUSTER_LABEL_LIST[1],
                  },
                },
                {
                  value: radarData[0][2],
                  name: "cluster3",
                  itemStyle: {
                    color: CLUSTER_LABEL_LIST[2],
                  },
                },
              ],
            },
          ],
        };
        radarChart.setOption(option);
        window.onresize = radarChart.resize;
      };
    return(
        <div className="radar" ref={radarRef}></div>
    )
}

export default Radar;