import { Select, Button } from "antd";
import { DatePicker } from "rsuite";
import { hourList, sixtyList } from "../utils/constant";
import { useState } from "react";
import "./controlPanel.css";
const ControlPanel = (props) => {
  const { handleChangeTime, handleSelectId, handleControlCamra } = props;
  const [yearStr, setYearStr] = useState("2023/4/");
  const [dayStr, setDayStr] = useState("");
  const [hourStr, setHourStr] = useState("8");
  const [minuteStr, setMinuteStr] = useState("13");
  const [secondStr, setSecondStr] = useState("13");
  const { cameFlag, setcamaFlag } = useState(1);

  // const timeSelect = ()=>{
  //   const timeStr = yearStr+dayStr+' '+hourStr+':'+minuteStr+':'+secondStr;
  //   handleChangeTime(Date.parse(timeStr)/1000);
  // }
  const timeSelect = (date) => {
    handleChangeTime(Date.parse(date) / 1000);
  };
  const changeId = () => {
    handleSelectId(269548444);
  };
  const styles = { width: 200, marginBottom: 10 };
  return (
    <div className="container" style={{ background: "#efefef" }}>
      <span style={{ lineHeight: "5px" }}>时间选择：</span>
      <DatePicker
      size="xs" placeholder="时间选择" style={styles}
        format="yyyy-MM-dd HH:mm:ss"
        onChange={timeSelect}
      />
    </div>
  );
};

export default ControlPanel;
