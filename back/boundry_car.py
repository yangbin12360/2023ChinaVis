import json
from shapely.geometry import LineString
import os
import json

# 判断机动车是否与车道边界线存在交点


file_path = './static/data/BoundryRoads/boundry1.json'
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)
boundryRoad=data

folder_path = './static/data/DataProcess/1'
# 获取文件夹中的所有文件
file_list = os.listdir(folder_path)
# 遍历文件列表，筛选出JSON文件并读取
for file_name in file_list:
    file_path = os.path.join(folder_path, file_name)
    track = []
    with open(file_path, 'r') as f:
        data = json.load(f)
        for item in data:
            pos = json.loads(item['position'])
            arr = []
            arr.append(pos['x'])
            arr.append(pos['y'])
            track.append(arr)
    for road in boundryRoad:
        line1_obj = LineString(road)
        line2_obj = LineString(track)
        if line1_obj.intersects(line2_obj):
            # 两条线存在交点
            print(file_name+"两条线存在交点")
            intersection_point = line1_obj.intersection(line2_obj)
            print(intersection_point)
            # print(road)
            #print(track)
        # else:
        #     # 两条线不存在交点
        #     print("两条线不存在交点")
    break    
      
        
