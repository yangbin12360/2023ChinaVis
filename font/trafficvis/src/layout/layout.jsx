import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import Box from "../components/Box/box";
import MainView from "../components/mainView/mainView";
import ControlPanel from "../components/controlPanel/controlPanel";
import "./layout.css";
import TestList from "../components/testList/testlist"
import ChordFlow from "../components/chordFlow/chordFlow";
import RelationshipScene from "../components/relationshipScene/relationshipScene";
const style = {
    background: '#0092ff',
    padding: '8px 0',
  };

const Layout = () => {
  // ----------------------- 初始化状态--------------------------
  const [timeStamp, setTimeStamp] = useState(1681372078);
  // ----------------------- 状态改变--------------------------
  const handleChangeTime = (timeStamp) => {
    setTimeStamp(timeStamp);
  }
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Row style={{ width: "100%", height: "100%" }}>
        <Col span={5} id="left">
          <div style={{ height: "33%" }} className="box">
            <Box
              title={"ControlPanel"}
              component={<ControlPanel timeStamp={timeStamp} handleChangeTime={handleChangeTime}></ControlPanel>}
            ></Box>
          </div>
          <div style={{ height: "34%" }}><Box title={"ChordFlow"} component = {<ChordFlow></ChordFlow>}></Box></div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"} ></Box></div>
        </Col>
        <Col span={11} id="middle">
          <div style={{ height: "67%" }}>
            <Box title={"MainView"} component={<MainView  timeStamp={timeStamp}></MainView>}></Box>
          </div>
          <div style={{ height: "33%" }}>
            <Box title={"relationshipScene"}  component = {<RelationshipScene></RelationshipScene>}></Box>
          </div>
        </Col>
        <Col span={8} id="right">
          <div style={{ height: "33%" }}><Box title={"List"} component={<TestList></TestList>}></Box></div>
          <div style={{ height: "34%" }}><Box title={"ControlPanel"}></Box></div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"}></Box></div>
        </Col>
      </Row>
    </div>
  );
};

export default Layout;
