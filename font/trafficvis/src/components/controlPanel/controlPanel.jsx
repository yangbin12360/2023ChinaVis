import { Select, Button } from "antd";
import { hourList, sixtyList } from "../utils/constant";
import { useState } from "react";

const ControlPanel = ({handleChangeTime}) => {
  const [yearStr, setYearStr] = useState("2023/4/");
  const [dayStr, setDayStr] = useState("");
  const [hourStr, setHourStr] = useState("8");
  const [minuteStr, setMinuteStr] = useState("13");
  const [secondStr, setSecondStr] = useState("13");

  const timeSelect = ()=>{
    const timeStr = yearStr+dayStr+' '+hourStr+':'+minuteStr+':'+secondStr;
    handleChangeTime(Date.parse(timeStr)/1000);
  }
  return (
    <div className="control">
      <div className="controlDay">
        日：
        <Select
          defaultValue="12"
          style={{
            width: 120,
          }}
          options={[
            {
              value: "12",
              label: "12",
            },
            {
              value: "13",
              label: "13",
            },
          ]}
          value={dayStr}
          onChange={(e) => {
            setDayStr(e);
          }}
        />
      </div>
      <div className="controlHour">
        时：
        <Select
          defaultValue="8"
          style={{
            width: 120,
          }}
          options={hourList}
          value={hourStr}
          onChange={(e) => setHourStr(e)}
        />
      </div>
      <div className="controlMinute">
        分：
        <Select
          defaultValue="13"
          style={{
            width: 120,
          }}
          options={sixtyList}
          value={minuteStr}
            onChange={(e) => setMinuteStr(e)}
        />
      </div>
      <div className="controlSecond">
        秒：
        <Select
          defaultValue="13"
          style={{
            width: 120,
          }}
          options={sixtyList}
            value={secondStr}
            onChange={(e) => setSecondStr(e)}
        />
      </div>
      <div className="controlButton">
        <Button onClick={timeSelect}>Default Button</Button>
      </div>
    </div>
  );
};

export default ControlPanel;