import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import Box from "../components/Box/box";
import MainView from "../components/mainView/mainView";
import ControlPanel from "../components/controlPanel/controlPanel";
import "./layout.css";
import TestList from "../components/testList/testlist";
import ChordFlow from "../components/chordFlow/chordFlow";
import RelationshipScene from "../components/relationshipScene/relationshipScene";
import SceneList from "../components/sceneList/sceneList";
import SingleTrace from "../components/singleTrace/singleTrace";
import RoseComponent from "../components/Rose/rose";
import ClusterScatter from "../components/clusterScatter/clusterScatter";
import ForecastHeat from "../components/forecastHeat/forecastHeat";
import RoadHealth from "../components/roadHealth/roadHealth";
import NowList from "../components/nowList/nowList";
const style = {
  background: "#0092ff",
  padding: "8px 0",
};

const Layout = () => {
  // ----------------------- 初始化状态--------------------------
  const [timeStamp, setTimeStamp] = useState(1681372078); //控制时间
  const [selectId, setSelectId] = useState(null); //高选框中
  const [selectTraceId, setSelectTraceId] = useState(null); //单轨迹绘制
  const [isTraceVisible, setIsTraceVisible] = useState(false); //单轨迹视图生成控制
  const [singleType, setSingleType] = useState(null); //场景列表类型获取
  const [nowTimeData, setNowTimeData] = useState([]);
  const [clusterSelectData, setClusterSelectData] = useState(null);
  // ----------------------- 状态改变--------------------------
  //控制板改变时间戳
  const handleChangeTime = (timeStamp) => {
    setTimeStamp(timeStamp);
  };
  //控制台id高亮选中主视图中的交通参与者
  const handleSelectId = (id) => {
    setSelectId(id);
  };
  //高价值场景列表传递id、type
  const handleSelectTraceId = (id, type) => {
    setIsTraceVisible(true);
    setSelectTraceId(id);
    setSingleType(type);
  };
  //主视图实时场景获取
  const handleNowTimeData = (newData) => {
    setNowTimeData(newData);
  };
  // ----------------------- 布局--------------------------
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#cacaca",
        position: "relative",
      }}
    >
      <Row style={{ width: "100%", height: "100%" }}>
        <Col span={4} id="left">
          <div style={{ height: "33%" }} className="box">
            <Box
              title={"ControlPanel"}
              component={
                <ControlPanel
                  timeStamp={timeStamp}
                  handleChangeTime={handleChangeTime}
                  handleSelectId={handleSelectId}
                ></ControlPanel>
              }
            ></Box>
          </div>
          <div style={{ height: "34%" }}>
            <Box title={"ChordFlow"}></Box>
          </div>
          {/* <div style={{ height: "34%" }}><Box title={"ChordFlow"} component = {<div><ChordFlow></ChordFlow></div>}></Box></div> */}
          <div style={{ height: "33%" }}>
            <Box
              title={"Rose"}
              component={<RoseComponent></RoseComponent>}
            ></Box>
          </div>
        </Col>
        <Col span={13} id="middle">
          <div style={{ height: "67%" }}>
            <Box
              title={"MainView"}
              component={
                <MainView timeStamp={timeStamp} selectId={selectId} handleNowTimeData ={handleNowTimeData}></MainView>
              }
            ></Box>
          </div>
          <div style={{ height: "33%" }}>
            <Box
              title={"relationshipScene"}
              component={<RelationshipScene></RelationshipScene>}
            ></Box>
          </div>
        </Col>
        <Col span={7} id="right">
          <div style={{ height: "17%" }}>
            <Box
              title={"SceneList"}
              component={
                <SceneList
                  timeStamp={timeStamp}
                  isTraceVisible={isTraceVisible}
                  selectTraceId={selectTraceId}
                  singleType={singleType}
                  handleSelectTraceId={handleSelectTraceId}
                ></SceneList>
              }
            ></Box>
          </div>
          <div style={{ height: "20%" }}>
            <Box
              title={"SingleTrace"}
              component={
                <SingleTrace
                  isTraceVisible={isTraceVisible}
                  selectTraceId={selectTraceId}
                  singleType={singleType}
                ></SingleTrace>
              }
            ></Box>
          </div>
          <div style={{ height: "25%" }}>
            <Box
              title={"DrivingBehaviorAnalysis"}
              component={
                <ClusterScatter timeStamp={timeStamp}></ClusterScatter>
              }
            ></Box>
          </div>
          <div style={{ height: "38%" }}>
            <Row style={{ width: "100%", height: "50%" }}>
              <Box
                title={"TrafficForecast"}
                component={<ForecastHeat></ForecastHeat>}
              ></Box>
            </Row>
            <Row style={{ width: "100%", height: "50%" }}>
              <Box
                title={"RoadHealth"}
                component={<RoadHealth></RoadHealth>}
              ></Box>
            </Row>
          </div>
        </Col>
      </Row>
      <div
        style={{
          left: "17%",
          top: "2%",
          width: 200,
          height: 200,
          position: "absolute",
          opacity: 0.5,
          background: "white",
          borderRadius: "50%",
        }}
      >
        <ChordFlow timeStamp={timeStamp}></ChordFlow>
      </div>
      <div
        style={{
          left: "56.8%",
          top: "3.3%",
          width: 400,
          height: 200,
          position: "absolute",
          opacity: 0.7,
          background: "white",
        }}
      >
        <NowList  nowTimeData ={nowTimeData} handleSelectId={handleSelectId}></NowList>
      </div>
    </div>
  );
};

export default Layout;
