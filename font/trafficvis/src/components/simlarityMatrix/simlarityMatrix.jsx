

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./simlarityMatrix.css";

const SimlarityMatrix = (props) => {
  const { dataset, embeddingMethod } = props;

  const matrixRef = useRef(null);

  const drawMatrix = (data, mark, w, h) => {
    console.log("data",data);
    console.log("mark",mark);
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
    let colorScale = d3.scaleSequential([0, 1], d3.interpolateGnBu);

    const ctx = canvas.getContext("2d");

    for (let i = 0; i < flatData.length; i++) {
      let row = parseInt(i / oneLine);
      let col = i % oneLine;
      if (row < col) {
        // 右上区域, origin space
        ctx.fillStyle = colorScale(minMaxScaler(flatData[i], mark[1], mark[0]));
      } else {
        // 左下区域, embedding space
        ctx.fillStyle = colorScale(minMaxScaler(flatData[i], mark[3], mark[2]));
      }

      ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
    }
  };

  useEffect(() => {
    const { width, height } = matrixRef.current.getBoundingClientRect();
    // drawMatrix(res["data"], res["mark"], width, height);
    // getSimilarity(dataset, embeddingMethod).then((res) => {
    //   drawMatrix(res["data"], res["mark"], width, height);
    // });
  }, [matrixRef.current, dataset, embeddingMethod]);

  return (
    <div id="similarity" ref={matrixRef}>
      <canvas id="similarity-canvas"></canvas>
    </div>
  );
};

const minMaxScaler = (n, min, max) => {
  return (n - min) / (max - min);
};

export default SimlarityMatrix;
