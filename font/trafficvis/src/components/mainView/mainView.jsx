import { Button } from "antd";
import React, { useRef, useEffect, useState } from "react"; // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from "three"; // 导入 Three.js 库
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getJson, getTimeJson } from "../../apis/api";
import traffic from "../../assets/gltf/traffic_modifiedV1.gltf";
import car from "../../assets/gltf/testcar.glb";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import road_back from "../../assets/road_pic/road_background.jpg";
// import sky_up from "../../assets/road_pic/py.png";
// import sky_right from "../../assets/road_pic/px.png";
// import sky_left from "../../assets/road_pic/nx.png";
// import sky_front from "../../assets/road_pic/nz.png";
// import sky_back from "../../assets/road_pic/pz.png";
// import sky_down from "../../assets/road_pic/ny.png";
import * as TWEEN from "@tweenjs/tween.js";
import "./mainView.css";

const mapName = ["boundary", "crosswalk", "lane", "signal", "stopline"];

const move = {
  x: -121,
  y: -104,
  z: -13,
  angle: 90,
};
const MainView = (props) => {
  const { timeStamp } = props; //选中时间点
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
    const loader = new GLTFLoader();
    loader.load(traffic, (gltf) => {
      gltf.scene.rotateX(THREE.MathUtils.degToRad(move.angle));
      gltf.scene.position.set(move.x, move.y, move.z);
      scene.add(gltf.scene);
    });

    // 存储场景、加载器、相机和渲染器以便后续使用
    setScene(scene);
    setLoader(loader);
    setCamera(camera);
    setRenderer(renderer);
    //创建天空盒  （6张图片都需要换）
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
    //     map: textureLoader.load(road_back),
    //   });
    //   cubeMaterial.map.wrapS = THREE.RepeatWrapping;
    //   cubeMaterial.map.wrapT = THREE.RepeatWrapping;
    //   cubeMaterial.map.repeat.set(8, 8); // 创建地平面并设置大小
    //   var planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    //   var plane = new THREE.Mesh(planeGeometry, cubeMaterial); // 设置平面位置并旋转

    //   plane.rotation.x = -0.5 * Math.PI;
    //   plane.position.x = 0;
    //   plane.position.y = 10;
    //   plane.position.z = 0;
    //   return plane;
    // } // 将平面添加到场景中
    // var plane = createPlaneGeometryBasicMaterial();
    // scene.add(plane);
    // const animate = () => {
    //   requestAnimationFrame(animate);
    //   renderer.render(scene, camera);
    // };

    // 创建动画
    function animate() {
      requestAnimationFrame(animate);
      TWEEN.update();
      renderer.render(scene, camera);
    }
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
    setTimeMsg(timeStamp);
    if (scene) {
      // 确保scene已经创建
      if (models != null) {
        console.log("销毁", models);
        for (let modelId in models) {
          if (models[modelId].instance != null) {
            destroyModel(models[modelId].instance, scene);
          }
        }
        setModels({});
      }
      getTimeJson(timeStamp).then((res) => {
        const data = res;
        //对所有交通参与者数据进行遍历，并创建小车模型等操作
        let modelsToLoad = {};
        for (let trafficId in data) {
          //交通参与者100s秒的轨迹
          const carTrace = movePosition(data[trafficId]["trace"]);
          modelsToLoad[trafficId] = {
            timestamp: parseFloat(
              data[trafficId]["startTime"] / 1000000 - timeStamp
            ),
            trace: carTrace,
            instance: null,
          };
          loader.load(car, (gltf) => {
            let instance = gltf.scene.clone();
            instance.visible = false;  // 设置初始可见性为 false
            modelsToLoad[trafficId].instance = instance;
            scene.add(instance);
          });
          //对每个交通参与者轨迹进行渲染
          // moveModel(0,instance,scene,carTrace)
        }
        
        setModels(modelsToLoad);
        const clock = new THREE.Clock();
        // 渲染循环
        const animate = () => {
          requestAnimationFrame(animate);
          // 检查是否有新模型需要加载
          const elapsedTime = clock.getElapsedTime();
          for (let modelId in modelsToLoad) {
            if (
              modelsToLoad[modelId].timestamp <= elapsedTime &&
              modelsToLoad[modelId].instance !== null 
              &&
            modelsToLoad[modelId].instance.visible === false
            ) {
              // loader.load(car, (gltf) => {
              //   let instance = gltf.scene.clone();
              //   modelsToLoad[modelId].instance = instance;
              //   scene.add(instance);
              //   moveModel(0, instance, scene, modelsToLoad[modelId].trace);
              // });
              modelsToLoad[modelId].instance.visible = true;
            moveModel(0, modelsToLoad[modelId].instance, scene, modelsToLoad[modelId].trace);
          }
          }
          // // 更新所有活动的 tween 对象
          TWEEN.update();
          renderer.render(scene, camera);
        };
        animate();
      });
    }
  }, [timeStamp, scene]); // 注意依赖项数组包含timeStamp和scene，表示只要这两者有任何一个变化，就运行这个回调

  useEffect(() => {
    const interval = setInterval(() => {
      setStandardTimeMsg(converTimestamp(timeMsg));
      setTimeMsg(timeMsg + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMsg]);

  return (
    <div className="mainView">
      <div className="timeMsg">{standardTimeMsg}</div>
      <div ref={containerRef}></div>
    </div>
  ); // 返回带有容器引用的 div 元素
};

//16位时间戳转换
const converTimestamp = (timestamp) => {
  // 将微秒时间戳转换为毫秒
  const milliseconds = timestamp * 1000;
  // 使用毫秒时间戳创建一个新的 Date 对象
  const date = new Date(milliseconds);
  // 返回日期和时间字符串
  return date.toLocaleString("en-US", { hour12: false });
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
const moveModel = (startIndex, model, scene, tracePositions) => {
  if (startIndex >= tracePositions.length - 1) {
    destroyModel(model, scene);
    return;
  }
  const tween = new TWEEN.Tween(tracePositions[startIndex])
    .to(tracePositions[startIndex + 1], 200)
    .onUpdate((tracePositions) => {
      model.position.copy(tracePositions);
    })
    .onComplete(() => {
      moveModel(startIndex + 1, model, scene, tracePositions);
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
