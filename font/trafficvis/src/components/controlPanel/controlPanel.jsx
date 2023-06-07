import { Select, Button } from "antd";
import { DatePicker} from "rsuite";
import SearchIcon from '@rsuite/icons/Search';
import { hourList, sixtyList } from "../utils/constant";
import { useState } from "react";
import { Input } from 'antd';
import "./controlPanel.css";
const { Search } = Input;

const ControlPanel = (props) => {
  const { handleChangeTime, handleSelectId,inputTextId,handleControlCamra,textId,textType, } = props;
  const [yearStr, setYearStr] = useState("2023/4/");
  const [dayStr, setDayStr] = useState("");
  const [hourStr, setHourStr] = useState("8");
  const [minuteStr, setMinuteStr] = useState("13");
  const [secondStr, setSecondStr] = useState("13");
  const { cameFlag, setcamaFlag } = useState(1);
  const [searchValue, setSearchValue] = useState(null);
  

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
  const handleInputChange = (e) => {
    inputTextId(e.target.value);
};
  const styles = { width: 200 ,paddingLeft:3,paddingTop:3};
  const onSearch = (value) => handleSelectId(value,textType);
  return (
    <div className="container" style={{ background: "#efefef" }}>
     <span style={{ paddingLeft:15,paddingTop:15}}>时间选择：</span>
      <DatePicker
      size="xs" placeholder="时间选择" style={styles}
        format="yyyy-MM-dd HH:mm:ss"
        onChange={timeSelect}
      />
      <span style={{ paddingLeft:30,paddingTop:5 }}>交通参与者查询:</span>
      <Search
      placeholder="输入Id"
      value={textId}
      allowClear
      size={"small"}
      onSearch={onSearch}
      onChange={handleInputChange}
      style={{
        width: 200,
        height: 30,
        paddingLeft:10,paddingTop:3
      }}
    />

    </div>
  );
};

export default ControlPanel;
