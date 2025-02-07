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
import Light from "../components/light/light";
import InfoList from "../components/infoList/infoList";
import Details from "../components/Details/Details";
import SimlarityMatrix from "../components/simlarityMatrix/simlarityMatrix";
import Radar from "../components/radar/radar";
const style = {
  background: "#0092ff",
  padding: "8px 0",
};

const Layout = () => {
  // ----------------------- 初始化状态--------------------------
  const [timeStamp, setTimeStamp] = useState(1681372078); //控制时间
  const [selectId, setSelectId] = useState(null); //高选框中
  const [selectTraceId, setSelectTraceId] = useState(269548444); //单轨迹绘制
  const [isTraceVisible, setIsTraceVisible] = useState(true); //单轨迹视图生成控制
  const [singleType, setSingleType] = useState(1); //场景列表类型获取
  const [nowTimeData, setNowTimeData] = useState([]);
  const [clusterSelectData, setClusterSelectData] = useState(null);
  const [roadId, setRoadId] = useState(null);
  const [controlCamra, setControlCamra] = useState(1);
  const [selectType, setSelectType] = useState(null); //主面板选中id展示
  const [flowTime, setFlowTime] = useState(1681372078);
  const [clusterArray, setClusterArray] = useState([]); //聚类散点图数据
  const [selectDir, setSelectDir] = useState("similarytiJson"); //相似度文件夹选择
  //细节图的参数
  const [time, setTime] = useState(1681315196);
  const [carNum, setcarNum] = useState(0);
  const [scence, setScence] = useState(0);
  const [flowtimeStamp,setFlowtimeStamp]=useState(1681372078);
  const [hourindex,setHourIndex]=useState(17);
  const [simCount, SetSimCount] = useState([]); //相似度矩阵中各个类别的个数
  const [allCluster, setAllCluster] = useState([]); //用来控制时间切换时候散点图的数组
const [textId,setTextId] = useState(null);
const [textType,setTextType] = useState(null);
  // ----------------------- 状态改变--------------------------
//修改文本框中的id
const handleTextId=(id,type)=>{
  setTextId(id);
  setTextType(type);
}
const inputTextId =(id)=>{
  setTextId(id);
}
  //控制allCluster
  const handleAllCluster = (cluter) => {
    setAllCluster(cluter);
  };
  //控制板改变时间戳
  const handleChangeTime = (timeStamp) => {
    console.log("timeStamp", timeStamp);
    setTimeStamp(timeStamp);
  };
  //控制台id高亮选中主视图中的交通参与者
  const handleSelectId = (id, type) => {
    console.log("11111111111");
    setSelectId(id);
    setSelectType(type);
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
  //玫瑰图时间戳改变
  const handleFlowtimeStamp = (newData) => {
    console.log("newData",newData);
    setFlowtimeStamp(newData);
  };
  //玫瑰图传花瓣序号
  const handleHourIndex = (newData) => {
    setHourIndex(newData);
  };
  //相机控制
  const handleControlCamra = (index) => {
    setControlCamra(index);
  };
  //获取散点图中选取的散点id
  const handleClusterNum = (array) => {
    console.log("获取到的array", array);
    setClusterArray(array);
  };
  //细节图的参数
  const handleDetail = (time, carnumber, scencenumber) => {
    setTime(time);
    setcarNum(carnumber);
    setScence(scencenumber);
  };
  //改变相似度文件夹选择
  const handleSelectDir = (dir) => {
    setSelectDir(dir);
  };
  //改变相似度矩阵中各个类别的个数
  const handleSimCount = (count) => {
    SetSimCount(count);
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
        <Col span={14} id="left">
          <Row style={{ width: "100%", height: "3%" }}>
            <div style={{width:"99.9%",height:"90%", fontSize:25,paddingLeft:500,fontWeight:"bolder",userSelect:"none",color:"black",background:'#efefef'}}>城市路口高价值场景与态势可视分析系统</div>
          </Row>
          <Row style={{ width: "100%", height: "62%" }}>
            <Col span={24} id="left_top">
              <div style={{ height: "100%" }}>
                <Box
                  title={"3D实时场景还原"}
                  component={
                    <MainView
                      timeStamp={timeStamp}
                      selectId={selectId}
                      handleNowTimeData={handleNowTimeData}
                    ></MainView>
                  }
                ></Box>
              </div>
            </Col>
          </Row>
          <Row style={{ width: "100%", height: "35%" }}>
            <Col span={15} id="left_bottom_left">
              <div style={{ height: "100%" }}>
                <Box
                  title={"高价值场景概览折线图"}
                  component={
                    <RelationshipScene
                      time={time}
                      carNum={carNum}
                      scence={scence}
                      handleDetail={handleDetail}
                      handleChangeTime={handleChangeTime}
                    ></RelationshipScene>
                  }
                ></Box>
              </div>
            </Col>
            <Col span={9} id="left_bottom_right">
              <div style={{ height: "100%" }}>
                <Box
                  title={"高价值场景特征仪表盘"}
                  component={
                    <Details
                      time={time}
                      carNum={carNum}
                      scence={scence}
                      handleDetail={handleDetail}
                    ></Details>
                  }
                ></Box>
              </div>
            </Col>
          </Row>
        </Col>
        <Col span={10} id="right">
          <Row style={{ height: "24.5%", width: "100%" }}>
            <Col span={15} id="right_top_left_">
              <Row tyle={{ height: "16%", width: "100%" }}>
                <Box
                  title={"控制台"}
                  component={
                    <ControlPanel
                      timeStamp={timeStamp}
                      handleChangeTime={handleChangeTime}
                      handleSelectId={handleSelectId}
                      handleControlCamra={handleControlCamra}
                      textId={textId}
                      inputTextId={inputTextId}
                    ></ControlPanel>
                  }
                ></Box>
              </Row>
              <Row style={{ height: "82%", width: "100%" }}>
                <div style={{ height: "100%", width: "50%" }}>
                  <Box
                    title={"群体驾驶行为聚类散点图"}
                    component={
                      <ClusterScatter
                        timeStamp={timeStamp}
                        handleClusterNum={handleClusterNum}
                        handleSimCount={handleSimCount}
                        selectDir={selectDir}
                        allCluster={allCluster}
                        handleAllCluster={handleAllCluster}
                      ></ClusterScatter>
                    }
                  ></Box>
                </div>
                <div style={{ height: "100%", width: "50%" }}>
                  <Box
                    title={"行为特征雷达图"}
                    component={<Radar timeStamp={timeStamp}></Radar>}
                  ></Box>
                </div>
              </Row>
            </Col>
            <Col span={9}>
              <Box
                title={"高价值场景与驾驶行为相关性分析图"}
                component={
                  <SimlarityMatrix
                    timeStamp={timeStamp}
                    clusterArray={clusterArray}
                    handleSelectDir={handleSelectDir}
                    selectDir={selectDir}
                    simCount={simCount}
                    allCluster={allCluster}
                  ></SimlarityMatrix>
                }
              ></Box>
            </Col>
          </Row>
          <Row style={{ height: "13.5%", width: "100%" }}>
            <div style={{ width: "100%" }}>
              <Box
                title={"高价值场景实时列表"}
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
          </Row>
          <Row style={{ height: "27%", width: "100%" }}>
            <div style={{ width: "100%" }}>
              <Box
                title={"交通参与个体轨迹图"}
                component={
                  <SingleTrace
                    isTraceVisible={isTraceVisible}
                    selectTraceId={selectTraceId}
                    singleType={singleType}
                    handleChangeTime={handleChangeTime}
                    handleSelectId={handleSelectId}
                    handleTextId={handleTextId}
                  ></SingleTrace>
                }
              ></Box>
            </div>
          </Row>
          <Row style={{ height: "35%", width: "100%" }}>
            <Col span={15} id="right_bottom_left">
              <Row style={{ height: "40%", width: "100%" }}>
                <div style={{ height: "100%", width: "40%" }}>
                  <Box
                    title={"红绿灯合理性分析柱状图"}
                    component={<Light timeStamp={timeStamp}></Light>}
                  ></Box>
                </div>
                <div style={{ height: "100%", width: "60%" }}>
                  <Box
                    title={"交通流量预测热力图"}
                    component={
                      <ForecastHeat flowTime={flowTime} flowtimeStamp={flowtimeStamp}></ForecastHeat>
                    }
                  ></Box>
                </div>
              </Row>
              <Row style={{ height: "60%", width: "100%" }}>
                <Box
                  title={"道路健康平行坐标图"}
                  component={<RoadHealth hourindex={hourindex}></RoadHealth>}
                ></Box>
              </Row>
            </Col>
            <Col span={9} id="right_bottom_right">
              <div style={{ height: "100%" }}>
                <Box
                  title={"车况概览与拥堵分析玫瑰图"}
                  component={<RoseComponent handleFlowtimeStamp={handleFlowtimeStamp} handleHourIndex={handleHourIndex}></RoseComponent>}
                ></Box>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* <div
        style={{
          left: "0.5%",
          top: "5%",
          width: 200,
          height: 200,
          position: "absolute",
          background: "white",
          borderRadius: "50%",
        }}
      > */}
        <ChordFlow timeStamp={timeStamp}></ChordFlow>
      {/* </div> */}
      <div
        style={{
          left: "42.6%",
          top: "6.4%",
          width: 400,
          height: 200,
          position: "absolute",
          opacity: 0.7,
          background: "white",
        }}
      >
        <NowList
          nowTimeData={nowTimeData}
          handleSelectId={handleSelectId}
        ></NowList>
      </div>
      <div
        style={{
          left: "42.62%",
          top: "5.01%",
          width: 199,
          height: 20,
          position: "absolute",
          opacity: 0.7,
          background: "white",
        }}
      >
        选中id:{selectId},type:{selectType}
      </div>
    </div>
  );
};

export default Layout;
