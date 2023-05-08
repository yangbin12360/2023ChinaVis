import json

# 获取边界轨迹线的数据，针对不同的车辆需要不同的边界线组合



def get_car_Boundry():
    file_path='./static/data/ChinaVis Data/road10map/boundaryroad_car.geojson'
    #遍历边界geojson数据，找出坐标
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data['features']
    boundryRoad = []
    for feature in features:
        geometry = feature['geometry']
        if geometry['type'] == 'LineString':
            coordinates = []
            for coordinate in geometry['coordinates']:
                x = coordinate[0]
                y = coordinate[1]
                arr = []
                arr.append(x)
                arr.append(y)
                coordinates.append(arr)
                #将坐标存入列表，形成轨迹线
            boundryRoad.append(coordinates)
            
    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(boundryRoad)

    # 打开文件并写入JSON字符串
    with open('./static/data/BoundryRoads/'+'boundry1'+ ".json", 'w') as f:
        f.write(json_string)        
    
if __name__ == '__main__':
  get_car_Boundry()            

