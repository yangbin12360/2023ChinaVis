import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import Box from "../components/Box/box";
import MainView from "../components/mainView/mainView";
import ControlPanel from "../components/controlPanel/controlPanel";
import "./layout.css";
import TestList from "../components/testList/testlist"
import ChordFlow from "../components/chordFlow/chordFlow";
import RelationshipScene from "../components/relationshipScene/relationshipScene";
import SceneList from "../components/sceneList/sceneList";
import RoseComponent from "../components/Rose/rose";
const style = {
    background: '#0092ff',
    padding: '8px 0',
  };

const Layout = () => {
  // ----------------------- 初始化状态--------------------------
  const [timeStamp, setTimeStamp] = useState(1681372078);//控制时间
  const [selectId,setSelectId] =useState(null)//高选框中
  // ----------------------- 状态改变--------------------------
  const handleChangeTime = (timeStamp) => {
    setTimeStamp(timeStamp);
  }
  const handleSelectId = (id)=>{
    setSelectId(id)
  }
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" ,background:"#cacaca" }}>
      <Row style={{ width: "100%", height: "100%" }}>
        <Col span={4} id="left">
          <div style={{ height: "33%" }} className="box">
            <Box
              title={"ControlPanel"}
              component={<ControlPanel timeStamp={timeStamp} handleChangeTime={handleChangeTime}
              handleSelectId={handleSelectId}
              ></ControlPanel>}
            ></Box>
          </div>
          <div style={{ height: "34%" }}><Box title={"ChordFlow"} component = {<ChordFlow></ChordFlow>}></Box></div>
          {/* <div style={{ height: "34%" }}><Box title={"ChordFlow"} component = {<div><ChordFlow></ChordFlow></div>}></Box></div> */}
          <div style={{ height: "33%" }}><Box title={"Rose"} component = {<RoseComponent></RoseComponent>} ></Box></div>
        </Col>
        <Col span={13} id="middle">
          <div style={{ height: "67%" }}>
            <Box title={"MainView"} component={<MainView  timeStamp={timeStamp} selectId={selectId}></MainView>}></Box>
          </div>
          <div style={{ height: "33%" }}>
            <Box title={"relationshipScene"}  component = {<RelationshipScene></RelationshipScene>}></Box>
          </div>
        </Col>
        <Col span={7} id="right">
          <div style={{ height: "33%" }}><Box title={"SceneList"} component={<SceneList></SceneList>}></Box></div>
          <div style={{ height: "34%" }}><Box title={"ControlPanel"}></Box></div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"}></Box></div>
        </Col>
      </Row>
    </div>
  );
};

export default Layout;
