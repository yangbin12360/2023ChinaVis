import json

file_path=['./static/data/ChinaVis Data/road10map/crosswalkroad10.geojson']

def getPolygon(file_path):
    for i,filepath in enumerate(file_path, start=1):
        
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        features = data['features']
        polygonRoad = []
        for feature in features:
            if feature['properties']['fid']==177 or feature['properties']['fid']==178:
                geometry = feature['geometry']
                coordinates = []
                for coordinate in geometry['coordinates']:
                    for item in coordinate:
                        x = item[0]
                        y = item[1]
                        arr = []
                        arr.append(x)
                        arr.append(y)
                        coordinates.append(arr)
                    polygonRoad.append(coordinates)
                
        # 将列表保存为JSON格式的字符串
        json_string = json.dumps(polygonRoad)

        # 打开文件并写入JSON字符串
        with open('./static/data/BoundryRoads/crosswalk/'+'poly'+str(i)+ ".json", 'w') as f:
            f.write(json_string)        
    
if __name__ == '__main__':
  getPolygon(file_path)            

