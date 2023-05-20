import { get, post } from "./http";

export const helloReact = () => {
  return post("/helloReact");
};

//获取cosswalkRoad10的json数据
export const getJson = () => {
  return post("/getJson");
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