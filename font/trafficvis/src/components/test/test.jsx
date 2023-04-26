import { useEffect} from "react";
import {helloReact} from "../../apis/api";



const Test = () => {
  
useEffect(()=>{
    helloReact().then(res=>{
        console.log(res)
    })
},[])
  return <div>1</div>;
};

export default Test;
