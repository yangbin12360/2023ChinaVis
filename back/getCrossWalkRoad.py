import json

# 获取人行道，假定行人不闯红灯，判断行人是否横穿马路需要把人行道的情况去掉
def getCrossWalk():
    file_path='./static/data/ChinaVis Data/road10map/crosswalkroad10.geojson'
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    features = data['features']
    walkRoad = []
    for feature in features:
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
            walkRoad.append(coordinates)
            
    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(walkRoad)

    # 打开文件并写入JSON字符串
    with open("./static/data/BoundryRoads/crosswalkroad.json", 'w') as f:
        f.write(json_string)        
    
if __name__ == '__main__':
  getCrossWalk()            

