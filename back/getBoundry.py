import json

file_path=['./static/data/ChinaVis Data/road10map/boundaryroad_car.geojson',
           './static/data/ChinaVis Data/road10map/boundaryroad_people.geojson',
           './static/data/ChinaVis Data/road10map/boundaryroad_non.geojson']

def getBoundry(file_path):
    for i,filepath in enumerate(file_path, start=1):
        
        with open(filepath, "r", encoding="utf-8") as f:
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
                boundryRoad.append(coordinates)
                
        # 将列表保存为JSON格式的字符串
        json_string = json.dumps(boundryRoad)

        # 打开文件并写入JSON字符串
        with open('./static/data/BoundryRoads/'+'boundry'+str(i)+ ".json", 'w') as f:
            f.write(json_string)        
    
if __name__ == '__main__':
  getBoundry(file_path)            

