import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Radio, RadioGroup, Form } from "rsuite";
import "./simlarityMatrix.css";
import { getSimilarity } from "../../apis/api";

const SimlarityMatrix = (props) => {
  const { timeStamp, clusterArray } = props;
  const matrixRef = useRef(null);
  const barRef = useRef(null);
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
  };

  const drawMatrix = (data, w, h) => {
    console.log("data", data);
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

      roundRect(
        ctx,
        col * squareSize,
        row * squareSize,
        squareSize,
        squareSize,
        squareSize / 3
      );
    }
  };

  // 在绘制相似度矩阵之前，先绘制两个长方形
  const drawRectangles = (ctx, w, h, data) => {
    // 计算每个类别的占比
    let ratios = data.map((d) => d / data.reduce((a, b) => a + b, 0));

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
  };

  const drawProgressBar = () => {
    const ratio = [67, 69, 23];
    const divWidth = barRef.current.offsetWidth;
    const divHeight = barRef.current.offsetHeight;
    const dimensions = {
      width: divWidth,
      height: divHeight,
      margin: { top: 20, right: 20, bottom: 30, left: 50 },
    };
    const boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    d3.selectAll("div#progressBar svg").remove();
    const svg = d3
      .select("#progressBar")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height])
      .attr("max-width", "100%")
      .attr("background", "#Fff");
    const bounds = svg
      .append("g")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    const colorScale = d3
      .scaleOrdinal()
      .domain([0, 1, 2]) // input
      .range(["red", "blue", "green"]); // output
    const total = d3.sum(ratio);
    const topRect = bounds.append("g").attr("id", "topRect");
    const leftRect = bounds.append("g").attr("id", "leftRect");
    topRect
      .selectAll("rect")
      .data(ratio)
      .enter()
      .append("rect")
      .attr("width", (d, i) => {
        const width = (d * 320) / total;
        return width;
      })
      .attr("height", 10)
      .attr("x", (d, i) => {
        return i === 0
          ? 0
          : (ratio.slice(0, i).reduce((a, b) => a + b) * 320) / total;
      })
      .attr("y", 35)
      .attr("fill", (d, i) => colorScale(i));
    leftRect.selectAll('rect')
            .data(ratio)
            .enter()
            .append("rect")
            .attr("height", (d, i) => {
              const width = (d * 320) / total;
              return width;
            })
            .attr("width", 10)
            .attr("y", (d, i) => {
              return i === 0
                ? 50
                : (ratio.slice(0, i).reduce((a, b) => a + b) * 320) / total+50;
            })
            .attr("x", -20)
            .attr("fill", (d, i) => colorScale(i));
  };
  const changeRadio = (value, event) => {
    console.log(value);
  };
  useEffect(() => {
    const { width, height } = matrixRef.current.getBoundingClientRect();
    getSimilarity(timeStamp).then((res) => {
      drawMatrix(res["data"], width, height);
      drawProgressBar();
    });
    //能够获取到各个类的数量，明天再来画
    console.log(clusterArray);
  }, [matrixRef.current, timeStamp]);

  return (
    <div className="container">
      <div id="progressBar" ref={barRef}></div>
      <div className="radio-box">
        {" "}
        <Form.Group controlId="radioList">
          <RadioGroup name="radioList" onChange={changeRadio} defaultValue="A" inline>
            <Radio value="A">原始维度</Radio>
            <Radio value="B">高价场景维度</Radio>
          </RadioGroup>
        </Form.Group>
      </div>
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
