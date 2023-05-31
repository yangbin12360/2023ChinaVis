import { Select, Button} from "antd";
import {Table} from 'rsuite'
import { hourList, sixtyList } from "../utils/constant";
import { useState } from "react";
import "./controlPanel.css";

const ControlPanel = (props) => {
  const {handleChangeTime,  handleSelectId} = props
  const [yearStr, setYearStr] = useState("2023/4/");
  const [dayStr, setDayStr] = useState("");
  const [hourStr, setHourStr] = useState("8");
  const [minuteStr, setMinuteStr] = useState("13");
  const [secondStr, setSecondStr] = useState("13");

  const timeSelect = ()=>{
    const timeStr = yearStr+dayStr+' '+hourStr+':'+minuteStr+':'+secondStr;
    handleChangeTime(Date.parse(timeStr)/1000);
  }
  const changeId =()=>{
    handleSelectId(269548444)
  }
  const { Column, HeaderCell, Cell } = Table;
  const data = [{ id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' },
  { id: 1, name: 'foobar', email: 'foobar@xxx.com' }];
  return (
    <div className="container">
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
        <Button onClick={timeSelect}>TimeChange</Button>
      </div>
      <div className="controlButton">
        <Button onClick={changeId}>Default Button</Button>
      </div>
      </div>
    </div>
  );
};

export default ControlPanel;
