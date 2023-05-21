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