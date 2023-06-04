

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./simlarityMatrix.css";
import { getSimilarity } from "../../apis/api";

const testData =[[0.1, 0.6, 0.3,],
[0.4, 0.5, 0.6, ],
[0.7, 0.3, 0.9, ],

];

// const testData1= [
//   0.9,
//   0.1,
//   0.9,
//   0.1
// ]


const SimlarityMatrix = (props) => {
  const {timeStamp,clusterArray} = props;
  const matrixRef = useRef(null);
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

  const drawMatrix = (data, w, h) => {
    console.log("data",data);
    document.getElementById("similarity-canvas").remove();
    let canvas = document.createElement("canvas");
    canvas.id = "similarity-canvas";
    document.getElementById("similarity").appendChild(canvas);

    const dimensions = {
      width: Math.min(w, h),
      height: Math.min(w, h),
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    };
    const boundedWidth = dimensions.width;
    const boundedHeight = dimensions.height;

    canvas.width = boundedWidth;
    canvas.height = boundedHeight;

    let oneLine = data.length;
    let squareSize;
    if (boundedHeight > boundedWidth) {
      squareSize = boundedWidth / oneLine.toFixed(2);
    } else {
      squareSize = boundedHeight / oneLine.toFixed(2);
    }

    let flatData = data.flat();
    let colorScale = d3.scaleSequential([-1, 1], d3.interpolateGnBu);

    const ctx = canvas.getContext("2d");

    for (let i = 0; i < flatData.length; i++) {
      let row = parseInt(i / oneLine);
      let col = i % oneLine;
      if (row < col) {
        // 右上区域, origin space
        ctx.fillStyle = colorScale(flatData[i]);
      } else {
        // 左下区域, embedding space
        ctx.fillStyle = colorScale(flatData[i]);
        
      }

      roundRect(ctx, col * squareSize, row * squareSize, squareSize, squareSize, squareSize / 3);
    }
  };

  // 在绘制相似度矩阵之前，先绘制两个长方形
const drawRectangles = (ctx, w, h, data) => {
  // 计算每个类别的占比
  let ratios = data.map(d => d / data.reduce((a, b) => a + b, 0));

  // 绘制上方的长方形
  let x = 0;
  for (let i = 0; i < ratios.length; i++) {
    ctx.fillStyle = d3.interpolateGnBu(ratios[i]);
    ctx.fillRect(x, 0, ratios[i] * w, 20);
    x += ratios[i] * w;
  }

  // 绘制左方的长方形
  let y = 0;
  for (let i = 0; i < ratios.length; i++) {
    ctx.fillStyle = d3.interpolateGnBu(ratios[i]);
    ctx.fillRect(0, y, 20, ratios[i] * h);
    y += ratios[i] * h;
  }
}

  useEffect(() => {
    const { width, height } = matrixRef.current.getBoundingClientRect();
    // const ctx = document.getElementById("similarity-canvas").getContext("2d");
    // drawRectangles(ctx, width, height, testData1);
    getSimilarity(timeStamp).then((res) => {
      drawMatrix(res["data"], width, height)
    })
    //能够获取到各个类的数量，明天再来画
    console.log(clusterArray);
    // drawMatrix(res, width, height)
    // drawMatrix(res["data"], res["mark"], width, height);
    // getSimilarity(dataset, embeddingMethod).then((res) => {
    //   drawMatrix(res["data"], res["mark"], width, height);
    // });
  }, [matrixRef.current, timeStamp]);

  return (
    <div className="container">
    <div className="radio-box">123</div>
    <div className="apply"></div>
    <div id="similarity" ref={matrixRef}>
      <canvas id="similarity-canvas"></canvas>
    </div>
    </div>
  );
};

const minMaxScaler = (n, min, max) => {
  return (n - min) / (max - min);
};

export default SimlarityMatrix;
