import { Col, Row } from "antd";
import Box from "../components/Box/box";
import MainView from "../components/mainView/mainView"
import ControlPanel from "../components/controlPanel/controlPanel"
import './layout.css'
import TestList from "../components/testList/testlist"
import ChordFlow from "../components/chordFlow/chordFlow";
const style = {
    background: '#0092ff',
    padding: '8px 0',
  };

const Layout = () => {
    
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Row style={{ width: "100%", height: "100%" }}>
        <Col span={5} id="left">
          <div style={{ height: "33%" }} className="box">
            <Box title={"ControlPanel"} component={<ControlPanel></ControlPanel>}></Box>
          </div>
          <div style={{ height: "34%" }}><Box title={"ChordFlow"} component = {<div><ChordFlow></ChordFlow></div>}></Box></div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"}></Box></div>
        </Col>
        <Col span={14} id="middle">
          <div style={{ height: "67%" }}>
            <Box title={"MainView"} component={
                <MainView></MainView>
            }>
            </Box>
          </div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"}></Box></div>
        </Col>
        <Col span={5} id="right">
          <div style={{ height: "33%" }}><Box title={"List"} component={<TestList></TestList>}></Box></div>
          <div style={{ height: "34%" }}><Box title={"ControlPanel"}></Box></div>
          <div style={{ height: "33%" }}><Box title={"ControlPanel"}></Box></div>
        </Col>
      </Row>
    </div>
  );
};

export default Layout;
