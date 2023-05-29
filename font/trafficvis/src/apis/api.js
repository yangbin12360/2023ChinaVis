import { get, post } from "./http";

export const helloReact = () => {
  return post("/helloReact");
};

//获取cosswalkRoad10的json数据
export const getJson = () => {
  return post("/getJson");
};

//获取cosswalkRoad10的json数据
export const getList= () => {
  return post("/getList");
};

/**
 * 
 * @param {时间戳} startTime
 * @returns 
 */
export const getTimeJson =(startTime)=>{
  return post('/getTimeJson',{
    startTime:startTime
  })
}
//获取高价值场景数据
export const getActionAndRoadCount= () => {
  return post("/getActionAndRoadCount");
};

/**
 * 
 * @param {时间戳} startTime
 * @returns 
 */
//获取弦图数据
export const getLittleRoadFlow= (startTime) => {
  return post("/getLittleRoadFlow",{
    startTime:startTime
  });
};

/**
 * 获取高价值场景列表数据
 * @param {时间戳} startTime
 * @returns 
 */
export const getHighValue =(startTime)=>{
  return post('/getHighValue',{
    startTime:startTime
  })
}