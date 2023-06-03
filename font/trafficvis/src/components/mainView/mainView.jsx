import React, { useRef, useEffect, useState } from "react"; // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from "three"; // 导入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getJson, getTimeJson } from "../../apis/api";
import traffic from "../../assets/gltf/traffic_modifiedV4.gltf";
import car from "../../assets/gltf/testcar.gltf";
import onecar from "../../assets/gltf/compressed1.glb";
import ferrari from "../../assets/gltf/fcar.gltf";
import type1 from "../../assets/gltf/type1.gltf";
import type2 from "../../assets/gltf/type2_1.gltf"
import type3 from "../../assets/gltf/type3_2.gltf";
import type4 from "../../assets/gltf/type4_1.gltf";
import type6 from "../../assets/gltf/type6.gltf";
import type10 from "../../assets/gltf/type10.gltf";

import { GUI } from "dat.gui";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
//import {draco} from "../../assets/draco/gltf/draco_decoder.js"
// import sky_up from '../../assets/fig/nz.png';
// import sky_right from '../../assets/fig/px.png';
// import sky_left from '../../assets/fig/nx.png';
// import sky_front from '../../assets/fig/ny.png';
// import sky_back from '../../assets/fig/py.png';
// import sky_down from '../../assets/fig/pz.png';
import * as TWEEN from "@tweenjs/tween.js";
import "./mainView.css";

const mapName = ["boundary", "crosswalk", "lane", "signal", "stopline"];

const move = {
  x: -121,
  y: -104,
  z: -13,
  angle: 90,
};


const updateCamera = (camera, model, scene) => {
  if (!model) return;
  
  const position = model.position.clone();
  position.z += 20; // Increase the z-coordinate to place the camera above the model

  const tween = new TWEEN.Tween(camera.position)
    .to(position, 2000)
    .onUpdate(() => {
      camera.lookAt(model.position);
    })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .start();
};
const MainView = (props) => {

  const { timeStamp, selectId, handleNowTimeData } = props; //选中时间点
  const containerRef = useRef(); // 使用 useRef 创建容器引用
  const [startTime, setStartTime] = useState(timeStamp);
  const [timeMsg, setTimeMsg] = useState(timeStamp);
  const [standardTimeMsg, setStandardTimeMsg] = useState(
    converTimestamp(timeMsg)
  );
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [loader, setLoader] = useState(null);
  const [models, setModels] = useState(null);
  const [dracoLoader, setDracoLoader] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);

  // 创建一个全局状态对象

  // const [selectId,setSelectId] = useState(null);
  /**********************场景、相机、光照、渲染器及地图模型和相机控制器 */
  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene();

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-81, -104, -13 + 150);
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 创建光源
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    // 导入地图模型
    const dracoL = new DRACOLoader();
    dracoL.setDecoderPath("/draco/");
    // dracoL.setDecoderConfig({ type: "js" });
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoL);
    loader.load(traffic, (gltf) => {
      gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
      gltf.scene.position.set(move.x, move.y, move.z);
      scene.add(gltf.scene);
    });
    // loader.load(testcar, (gltf) => {
    //   gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
    //   gltf.scene.position.set(move.x, move.y, move.z);
    //   scene.add(gltf.scene);
    // });
    // loader.load(ferrari, (gltf) => {
    //   gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
    //   gltf.scene.position.set(move.x, move.y, move.z+150);
    //   scene.add(gltf.scene);
    // })
    // 存储场景、加载器、相机和渲染器以便后续使用
    setScene(scene);
    setLoader(loader);
    setCamera(camera);
    setRenderer(renderer);
    //创建天空盒
    // scene.background = new THREE.CubeTextureLoader().load([sky_right,sky_left,sky_up,sky_down,sky_back,sky_front]);
    // scene.background = new THREE.CubeTextureLoader().load([
    //   sky_right,
    //   sky_left,
    //   sky_up,
    //   sky_down,
    //   sky_back,
    //   sky_front,
    // ]);
    // function createPlaneGeometryBasicMaterial() {
    //   var textureLoader = new THREE.TextureLoader();
    //   var cubeMaterial = new THREE.MeshStandardMaterial({
    //     map: textureLoader.load(road_background),
    //   });
    //   cubeMaterial.map.wrapS = THREE.RepeatWrapping;
    //   cubeMaterial.map.wrapT = THREE.RepeatWrapping;
    //   cubeMaterial.map.repeat.set(8, 8); // 创建地平面并设置大小
    //   var planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    //   var plane = new THREE.Mesh(planeGeometry, cubeMaterial); // 设置平面位置并旋转
    //   //plane.rotateX(THREE.MathUtils.degToRad(move.angle));
    //   plane.position.set(move.x, move.y, move.z);
    //   // plane.rotation.x = -0.5 * Math.PI;
    //   // plane.position.x = 0;
    //   // plane.position.y = 10;
    //   // plane.position.z = 0;
    //   return plane;
    // } // 将平面添加到场景中
    // var plane = createPlaneGeometryBasicMaterial();
    // scene.add(plane);
    // const animate = () => {
    //   requestAnimationFrame(animate);
    //   renderer.render(scene, camera);
    // };
    // 创建动画
    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();
      renderer.render(scene, camera);
    };
    animate();
    //创建一个控制器，控制器会自动绑定到相机上
    const controls = new OrbitControls(camera, renderer.domElement);
    //设置控制器的中心点
    controls.target.set(-121, -104, -13);
    //控制器平移
    controls.enablePan = true;
    // controls.enableDamping = true;
    controls.enableRotate = true;
    controls.update();
  }, []); // 注意这里依赖项数组为空，表示只在组件首次挂载时运行


  useEffect(() => {
    if (!camera || !models || !models[selectId]) return;
  
    const selectedModel = models[selectId].instance;
    updateCamera(camera, selectedModel, scene,  );
  
  }, [selectId, camera, models, scene]);
  /**********************timemeans发生改变，引起各类交通参与者模型进行更新*/
  useEffect(() => {
    setTimeMsg(timeStamp);
    if (scene) {
      // 确保scene已经创建
      if (models != null) {
        // console.log("销毁", models);
        for (let modelId in models) {
          if (models[modelId].instance != null) {
            destroyModel(models[modelId].instance, scene);
          }
        }
        setModels({});
      }
      getTimeJson(timeStamp).then((res) => {
        let quaternion = new THREE.Quaternion()
        const data = res;
        // console.log(("data",data));
        //对所有交通参与者数据进行遍历，并创建小车模型等操作
        let modelsToLoad = {};
        for (let trafficId in data) {
          const carTrace = movePosition(data[trafficId]["trace"]);
          const directions = data[trafficId]["orientation"];
          const velocity = data[trafficId]["velocity"];
          const type = data[trafficId]["type"];
          modelsToLoad[trafficId] = {
            timestamp: parseFloat(
              data[trafficId]["startTime"] / 1000000 - timeStamp
            ),
            trace: carTrace,
            instance: null,
            halo: null,
            id: trafficId,
            directions: directions,
            velocity: velocity,
            type: type,
            startTime:parseInt(data[trafficId]["startTime"] / 1000000),
            endTime:parseInt(data[trafficId]["endTime"] / 1000000),
            isMoving:false
          };
          const shape = JSON.parse(data[trafficId]["shape"]);
          let typeIndex
          if (modelsToLoad[trafficId]["type"]===1){
            typeIndex = type1
          } else if(modelsToLoad[trafficId]["type"]===4){
            typeIndex = type4
          }
          else if(modelsToLoad[trafficId]["type"]===3){
            typeIndex = type3
          }else if(modelsToLoad[trafficId]["type"]===6){
            typeIndex = type6
          }else if(modelsToLoad[trafficId]["type"]===2)
          {
            typeIndex = type2
          }else if(modelsToLoad[trafficId]["type"]===10)
          {
            typeIndex = type10
          }else{
            typeIndex = car
          }
          loader.load(typeIndex, (gltf) => {
            let instance = gltf.scene.clone();
            // instance.rotation.y = -Math.PI/2 *2;
            // instance.rotation.x = -Math.PI/2 *2;
            instance.up.set(0, 0, 1); // Set the up vector to the Z axis

            // Set the initial rotation of the model
            instance.rotation.x =  Math.PI /4;
            instance.rotation.y = -Math.PI /2 ;
            instance.rotation.z = -Math.PI/4;
            const geometry = new THREE.TorusGeometry(1, 0.5, 16, 100); // 配置光环几何属性
            const material = new THREE.MeshBasicMaterial({ color: "red" }); // 配置光环材料属性
            const halo = new THREE.Mesh(geometry, material); // 创建光环
            halo.position.z = -1; // 将光环置于模型底部
            halo.visible = false; // 初始设为不可见
            instance.add(halo); // 将光环添加到模型中
            instance.userData.id = trafficId;
            // instance.scale.set(shape.x / 4, shape.y / 4, shape.z / 4); // 设置模型的大小
            instance.visible = false; // 设置初始可见性为 false
            modelsToLoad[trafficId].instance = instance;
            modelsToLoad[trafficId].halo = halo; // 存储对光环的引用以便后续使用
            scene.add(instance);
          });
          //对每个交通参与者轨迹进行渲染
          // moveModel(0,instance,scene,carTrace)
        }

        setModels(modelsToLoad);

        // 在车辆模型加载完毕后创建 GUI 控制器

        // console.log("modelsToLoad", models);
        const clock = new THREE.Clock();
        // console.log("clock",clock);
        // 渲染循环
        const animate = () => {
          requestAnimationFrame(animate);
          // console.log(modelsTooad);
          // 检查是否有新模型需要加载
          const elapsedTime = clock.getElapsedTime();
          let modelsData =[]
          // console.log("elapsedTime",elapsedTime);
          for (let modelId in modelsToLoad) {
            if (
              modelsToLoad[modelId].timestamp <= elapsedTime &&
              modelsToLoad[modelId].instance !== null &&
              modelsToLoad[modelId].instance.visible === false
            ) {
              modelsToLoad[modelId].instance.visible = true;
              moveModel(
                0,
                modelsToLoad[modelId].instance,
                scene,
                modelsToLoad[modelId].trace,
                modelsToLoad[modelId].directions
              );
            }
            // 检查模型是否正在运动且显示
            // console.log("timeMsg",standardTimeMsg);
            // console.log(modelsToLoad[modelId].startTime );
            if (
              modelsToLoad[modelId].instance !== null
              &&
              modelsToLoad[modelId].instance.visible === true
              &&
              modelsToLoad[modelId].timestamp <= elapsedTime
              
            ) {
              // 获取模型的信息
              const modelInfo = {
                id: modelId,
                timestamp: modelsToLoad[modelId].timestamp,
                trace: modelsToLoad[modelId].trace,
                position: modelsToLoad[modelId].instance.position,
                rotation: modelsToLoad[modelId].instance.rotation,
                scale: modelsToLoad[modelId].instance.scale,
                velocity:modelsToLoad[modelId].velocity,
                type:modelsToLoad[modelId].type,
                startTime:modelsToLoad[modelId].startTime,
                endTime:modelsToLoad[modelId].endTime
              };
              modelsData.push(modelInfo);
            }
          }
          handleNowTimeData(modelsData)
          // 更新所有活动的 tween 对象
          TWEEN.update();
          renderer.render(scene, camera);
        };
        animate();
      });
    }
  }, [timeStamp, scene]);
  /**********************光圈选中及销毁 */
  useEffect(() => {
    for (let id in models) {
      const model = models[id];
      if (id === String(selectId)) {
        // console.log("model", model.halo);
        model.halo.visible = true; // 只有被选中的模型的光环才可见
      }
    }
  }, [selectId, models]);
  /**********************静态信息展示*/
  useEffect(() => {
    const interval = setInterval(() => {
      setStandardTimeMsg(converTimestamp(timeMsg));
      setTimeMsg(timeMsg + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMsg]);

  return (
    <div className="mainView">
      <div className="timeMsg">当前时间：{standardTimeMsg}</div>
      <div ref={containerRef}></div>
      <div className="activaTable"></div>
    </div>
  ); // 返回带有容器引用的 div 元素
};
//16位时间戳转换
const converTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

//******************封装单一交通参与者轨迹放入、模型运动、模型销毁四大功能 */
// 单一模型轨迹
const movePosition = (data) => {
  let tracePositions = [];
  data.forEach((point) => {
    point = JSON.parse(point);
    const arr = [point.x, point.y];
    tracePositions.push(new THREE.Vector3(arr[0], arr[1]));
  });
  return tracePositions;
};
//根据轨迹移动模型
const moveModel = (startIndex, model, scene, tracePositions, directions) => {
  if (startIndex >= tracePositions.length - 1) {
    destroyModel(model, scene);
    return;
  }
  let directLength = tracePositions.length
  const tween = new TWEEN.Tween(tracePositions[startIndex])
    .to(tracePositions[startIndex + 1], 200)
    .onUpdate((currentPosition) => {
      model.position.copy(currentPosition);
      if (startIndex < directLength  - 2) {
        // ...
        model.isMoving = !model.position.equals(tracePositions[startIndex + 2]);
        if(model.isMoving){
        model.up.set(0, 0, 1); // Ensure the up vector always points to the Z axis
        model.lookAt(tracePositions[startIndex + 2]);}
        // ...
      }
    })
    .onComplete(() => {
      moveModel(startIndex + 1, model, scene, tracePositions, directions);
    })
    .start();
};
//销毁模型
const destroyModel = (model, scene) => {
  // Stop the tween if it exists.
  // Remove the model from the scene.
  scene.remove(model);
  // Dispose of the model's geometry, material, and texture data.
  model.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          for (let i = 0; i < child.material.length; ++i) {
            child.material[i].dispose();
            if (child.material[i].map) {
              child.material[i].map.dispose();
            }
          }
        } else {
          child.material.dispose();
          if (child.material.map) {
            child.material.map.dispose();
          }
        }
      }
    }
  });
};

export default MainView; // 导出 Polygon 组件
