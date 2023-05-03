import json
from shapely.geometry import LineString,Polygon
import os
import json



file_path1 = './static/data/BoundryRoads/boundry2.json'
with open(file_path1, "r", encoding="utf-8") as f:
    boundryRoad = json.load(f)
    
file_path2 = './static/data/BoundryRoads/crosswalk/poly1.json'
with open(file_path2, "r", encoding="utf-8") as f:
    crosswalkRoad = json.load(f)
# print(crosswalkRoad)

count=0
folder_path = './static/data/DataProcess/2'
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
        # 定义一个Polygon
        polygon1 = Polygon(crosswalkRoad[0])
        polygon2 = Polygon(crosswalkRoad[1])
        line2_obj = LineString(track)
        if not line2_obj.intersects(polygon1) and not line2_obj.intersects(polygon2):        
            for road in boundryRoad:
                line1_obj = LineString(road)
                if line1_obj.intersects(line2_obj):
                    # 两条线存在交点
                    print(file_name+"两条线存在交点")
                    intersection_point = line1_obj.intersection(line2_obj)
                    print(intersection_point)
                    # print(road)
                    print(track)
                # else:
                #     # 两条线不存在交点
                #     print("两条线不存在交点")
    count+=1
    if count>50:
        break    
      
        
