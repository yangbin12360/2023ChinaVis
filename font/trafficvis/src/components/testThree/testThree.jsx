import React, { useRef, useEffect } from 'react';  // 导入 React 和 useRef 和 useEffect hooks
import * as THREE from 'three';  // 导入 Three.js 库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getJson } from '../../apis/api';

const mapName = ['boundary','crosswalk','lane','signal','stopline']
const data = {
    "type": "FeatureCollection",
    "name": "crosswalk",
    "features":[
        {
            "type": "Feature",
            "properties": {
                "fid": 90
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -235.3956767711,
                            36.2900656768,
                            11.9785785522
                        ],
                        [
                            -230.5305509062,
                            33.4615041274,
                            11.9218997803
                        ],
                        [
                            -243.2873634939,
                            -2.0157291059,
                            11.9224252548
                        ],
                        [
                            -247.5514200296,
                            0.614833135,
                            11.9662618484
                        ],
                        [
                            -235.3956767711,
                            36.2900656768,
                            11.9785785522
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 173
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -71.8502991269,
                            -107.8074975589,
                            12.1283073273
                        ],
                        [
                            -53.9252544569,
                            -73.3040613211,
                            12.1100978699
                        ],
                        [
                            -47.4376621475,
                            -72.0574973009,
                            12.1874418106
                        ],
                        [
                            -67.5009735674,
                            -110.4826057482,
                            12.1201476898
                        ],
                        [
                            -71.8502991269,
                            -107.8074975589,
                            12.1283073273
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 174
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -43.170227655,
                            -68.800052635,
                            12.192852005
                        ],
                        [
                            -7.502118464,
                            -91.9843236091,
                            12.1857805099
                        ],
                        [
                            -6.7014058087,
                            -98.6447970601,
                            12.0476474609
                        ],
                        [
                            -47.1737909315,
                            -72.2940714945,
                            12.1874418106
                        ],
                        [
                            -43.170227655,
                            -68.800052635,
                            12.192852005
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 175
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -20.9140554404,
                            -146.9787246168,
                            11.8163261261
                        ],
                        [
                            -0.0591303726,
                            -105.8512109578,
                            11.8305616226
                        ],
                        [
                            4.2265021348,
                            -108.7173983036,
                            11.8037090149
                        ],
                        [
                            -15.4728489873,
                            -147.5610610934,
                            11.8168487396
                        ],
                        [
                            -20.9140554404,
                            -146.9787246168,
                            11.8163261261
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 176
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -61.0588762951,
                            -123.6124734938,
                            11.9654674377
                        ],
                        [
                            -23.2252033318,
                            -148.5437538977,
                            11.8166246262
                        ],
                        [
                            -27.4107467573,
                            -151.8375945934,
                            11.796077713
                        ],
                        [
                            -62.8604797696,
                            -128.5623335448,
                            11.9142703857
                        ],
                        [
                            -61.0588762951,
                            -123.6124734938,
                            11.9654674377
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 177
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -99.4020936755,
                            -218.2057549095,
                            11.9655437317
                        ],
                        [
                            -84.1885532246,
                            -224.7327762512,
                            12.1218576279
                        ],
                        [
                            -86.1782028529,
                            -229.6341082625,
                            12.1338062134
                        ],
                        [
                            -101.3189512442,
                            -222.8826447371,
                            11.9805536118
                        ],
                        [
                            -99.4020936755,
                            -218.2057549095,
                            11.9655437317
                        ]
                    ]
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "fid": 178
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -83.0602763012,
                            -232.3820085114,
                            11.9983033981
                        ],
                        [
                            -64.7652053284,
                            -240.3648710446,
                            11.9685573425
                        ],
                        [
                            -68.2895542128,
                            -244.3805663311,
                            11.9852523651
                        ],
                        [
                            -84.8558137707,
                            -236.9436442447,
                            12.0092258301
                        ],
                        [
                            -83.0602763012,
                            -232.3820085114,
                            11.9983033981
                        ]
                    ]
                ]
            }
        }
    ]
    }


const TestThree = ({}) => {
  const containerRef = useRef();  // 使用 useRef 创建容器引用

  useEffect(() => {
        // //判断先前是否已经创建了渲染器实例，如果已经创建了，就不再创建
        // if (containerRef.current) {
        //     return;
        //   }
        getJson().then((res)=>{
            const geoJsonData = res
            drawThree(geoJsonData);
        })
}, []);
 const drawThree = (data)=>{
         // 创建场景
         const scene = new THREE.Scene();

         // 创建相机
         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
         camera.position.set(10,-100,250);
     
         // 创建渲染器
         const renderer = new THREE.WebGLRenderer();
         renderer.setSize(window.innerWidth, window.innerHeight);
         containerRef.current.appendChild(renderer.domElement);
     
         // 创建光源
         const light = new THREE.DirectionalLight(0xffffff, 1);
         light.position.set(5, 1, 1);
         scene.add(light);
     
         // 创建多边形并添加到场景中
        //  data.features.forEach((feature) => {
        //    const shape = new THREE.Shape();
     
        //    const coordinates = feature.geometry.coordinates[0];
        //    const [startX, startY, startZ] = coordinates[0];
        //    shape.moveTo(startX, startY);
     
        //    for (let i = 1; i < coordinates.length; i++) {
        //      const [x, y, z] = coordinates[i];
        //      shape.lineTo(x, y);
        //    }
        //    const geometry = new THREE.ShapeGeometry(shape);
        //    const material = new THREE.MeshBasicMaterial({ color: 'pink', side: THREE.DoubleSide });
        //    const mesh = new THREE.Mesh(geometry, material);
        //    scene.add(mesh);
        //  });
            // 处理GeoJSON数据
    const handleGeoJSON = (data) => {
        data.features.forEach((feature) => {
          if (feature.geometry.type === "Polygon") {
            const shape = new THREE.Shape();
  
            const coordinates = feature.geometry.coordinates[0];
            const [startX, startY, startZ] = coordinates[0];
            shape.moveTo(startX, startY);
  
            for (let i = 1; i < coordinates.length; i++) {
              const [x, y, z] = coordinates[i];
              shape.lineTo(x, y);
            }
  
            const geometry = new THREE.ShapeGeometry(shape);
            const material = new THREE.MeshBasicMaterial({ color: '#003566', side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
          } else if (feature.geometry.type === "LineString") {
            const colorList =['red','yellow','#ffc2d1']
            let i = 0
            if(data.name == 'lane')
                i=1
            if(data.name == 'stopline')
                i=2
            console.log('data',data.name);
            const coordinates = feature.geometry.coordinates;
            const material = new THREE.LineBasicMaterial({ color:colorList[i]});
            const geometry = new THREE.BufferGeometry().setFromPoints(coordinates.map(([x, y]) => new THREE.Vector2(x, y)));
  
            const line = new THREE.Line(geometry, material);
            scene.add(line);
          }
        });
      };
      handleGeoJSON(data[mapName[0]]);
      handleGeoJSON(data[mapName[1]]);
      handleGeoJSON(data[mapName[2]]);
      handleGeoJSON(data[mapName[4]]);
         // 渲染循环
         const animate = function () {
           requestAnimationFrame(animate);
     
           // 按需更新场景，相机等属性
           renderer.render(scene, camera);
         };
         animate();
         //创建一个控制器，控制器会自动绑定到相机上
const controls = new OrbitControls(camera, renderer.domElement);
    //设置控制器的中心点
    controls.target.set(0, -100, 0);
    //控制器平移
    controls.enablePan = true;
    // controls.enableDamping = true;
            controls.update();
 }
return <div ref={containerRef} />; // 返回带有容器引用的 div 元素
};
export default TestThree; // 导出 Polygon 组件