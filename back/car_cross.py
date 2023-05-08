import json
from shapely.geometry import LineString,Point
import os

# 判断机动车是否与车道边界线存在交点


# file_path = './static/data/BoundryRoads/boundry1.json'
# with open(file_path, "r", encoding="utf-8") as f:
#     data = json.load(f)
# boundryRoad=data
# count=0
# folder_path = './static/data/DataProcess/1'
# # 获取文件夹中的所有文件
# file_list = os.listdir(folder_path)
# # 遍历文件列表，筛选出JSON文件并读取
# for file_name in file_list:
#     file_path = os.path.join(folder_path, file_name)
#     track = []
#     temporary_data=[]
#     with open(file_path, 'r') as f:
#         data = json.load(f)
#         for item in data:
#             pos = json.loads(item['position'])
#             arr = []
#             arr.append(pos['x'])
#             arr.append(pos['y'])
#             track.append(arr)   
#             temporary_data.append({
#                 'position':pos,
#                 'time_stamp':item['time_meas']
#             })     
#     for road in boundryRoad:
#         line1_obj = LineString(road)
#         line2_obj = LineString(track)
#         if line1_obj.intersects(line2_obj):
#             # 两条线存在交点
#             print(file_name+"两条线存在交点")
#             intersection_point = line1_obj.intersection(line2_obj)
#             # 判断交点的类型
#             if intersection_point.geom_type == 'Point':
#                 # 计算每个点与给定点之间的距离
#                 distances = [intersection_point.distance(Point(coord)) for coord in track]
#                 # 找到距离最短的点
#                 min_dist_index = distances.index(min(distances))
#                 closest_point = track[min_dist_index]
#                 print(closest_point)
#             elif intersection_point.geom_type == 'MultiPoint':
#                 # 遍历所有坐标
#                 for inter_point in intersection_point.geoms:
#                     # 计算每个点与给定点之间的距离
#                     distances = [inter_point.distance(Point(coord)) for coord in track]
#                     # 找到距离最短的点
#                     min_dist_index = distances.index(min(distances))
#                     closest_point = track[min_dist_index]
#                     print(closest_point)
#                     print(temporary_data)
#             # print(num)
#             # print(road)
#             #print(track)
#         # else:
#         #     # 两条线不存在交点
#         #     print("两条线不存在交点")  
#     count+=1
#     if count>4:
#         break      
      

                             
def car_cross():
    
    car_cross_data=[]
    #获取边界数据，用于画线
    boundry_path = './static/data/BoundryRoads/boundry1.json'
    with open(boundry_path, "r", encoding="utf-8") as f:
        boundryRoad = json.load(f)

    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        if not os.path.isdir(folder_path) or folder_name not in ['1', '4', '6']:#机动车才被检测
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            track = [] #车辆轨迹
            temporary_data=[]  #临时数据，用于找时间
            count=0
            closest_points=[] #保存距离交点最近的坐标
            time_data=[]   #保存发生时间
            with open(file_path, 'r') as f:
                data = json.load(f)
            #获取车辆轨迹
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                track.append(arr)
                #保存临时数据
                temporary_data.append({
                    'position':pos,
                    'time_stamp':item['time_meas']
                })
            #针对每条边界判断车辆轨迹是否与之存在交点
            for road in boundryRoad:
                line1_obj = LineString(road)
                line2_obj = LineString(track)
                if line1_obj.intersects(line2_obj):
                    # 两条线存在交点
                    intersection_point = line1_obj.intersection(line2_obj)
                    # 判断交点的类型，并统计数量
                    if intersection_point.geom_type == 'Point':
                        count += 1
                        # 计算每个点与给定点之间的距离
                        distances = [intersection_point.distance(Point(coord)) for coord in track]
                        # 找到距离最短的点
                        min_dist_index = distances.index(min(distances))
                        closest_point = track[min_dist_index]
                        closest_points.append(closest_point)
                    elif intersection_point.geom_type == 'MultiPoint':
                        #计算次数
                        count += len(intersection_point.geoms)
                        # 遍历所有交点坐标
                        for inter_point in intersection_point.geoms:
                            # 计算每个点与给定点之间的距离
                            distances = [inter_point.distance(Point(coord)) for coord in track]
                            # 找到距离最短的点
                            min_dist_index = distances.index(min(distances))
                            closest_point = track[min_dist_index]
                            closest_points.append(closest_point)
            #寻找高价值场景发生时间    
            for p in closest_points:
                for d in temporary_data:
                    if p[0]==d['position']['x'] and p[1]==d['position']['y']:
                        time_data.append(d['time_stamp'])
                        break   
            if count>0:        
                car_cross_data.append({
                    'id':data[0]['id'],
                    'type':data[0]['type'],
                    'count':count,
                    'time_arr':time_data
                })
    
    car_cross_path = './static/data/DataResult/car_cross.json'
    with open(car_cross_path, 'w') as f:
        json.dump(car_cross_data, f)
        
if __name__ == '__main__':
  car_cross()
    