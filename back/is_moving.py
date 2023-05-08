import json
from shapely.geometry import Point,Polygon
import os

#判断车辆是否存在长时间停车状态，阈值是5分钟
def is_moving():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        car_polygons = json.load(f)
        
    long_time_data=[]    
        
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
            with open(file_path, 'r') as f:
                data = json.load(f)
            i=0
            time_data=[]
            while i<len(data):
                if data[i]['is_moving']==0:
                    left=i
                    for j in range(left, len(data)):
                        i+=1
                        if data[j]['is_moving']==1 or j==len(data)-1:
                            interval_time=(data[j-1]['time_meas']-data[left]['time_meas'])/60000000
                            if interval_time>5:
                                for polygon in car_polygons:
                                    pos = json.loads(data[left]['position'])
                                    point1 = Point(pos['x'],pos['y'])
                                    if Polygon(polygon).contains(point1):
                                        # print(file_name+"该车存在长时间停车行为")
                                        # print(data[left]['time_meas'],data[j-1]['time_meas'],interval_time)
                                        time_data.append([data[left]['time_meas'],data[j-1]['time_meas']])
                                        break
                                        
                            break
                else:
                    i+=1
            
            if len(time_data)>0:
                long_time_data.append({
                    'id':data[0]['id'],
                    'type':data[0]['type'],
                    'time_arr':time_data
                })  
    
    long_time_path = './static/data/DataResult/long_time.json'
    with open(long_time_path, 'w') as f:
        json.dump(long_time_data, f)                  
                                
if __name__ == '__main__':
  is_moving()
  
  
  
  
# # 获取多边形坐标数据
# file_path1 = './static/data/BoundryRoads/polygons_people.json'
# with open(file_path1, "r", encoding="utf-8") as f:
#     car_polygons = json.load(f)

# folder_path = './static/data/DataProcess/4'
# # 获取文件夹中的所有文件
# file_list = os.listdir(folder_path)
# count=0
# # 遍历文件列表，筛选出JSON文件并读取
# for file_name in file_list:
#     file_path = os.path.join(folder_path, file_name)
#     with open(file_path, 'r') as f:
#         data = json.load(f)
#     i=0
#     while i<len(data):
#         if data[i]['is_moving']==0:
#             left=i
#             for j in range(left, len(data)):
#                 i+=1
#                 if data[j]['is_moving']==1 or j==len(data)-1:
#                     interval_time=(data[j-1]['time_meas']-data[left]['time_meas'])/60000000
#                     if interval_time>5:
#                         for polygon in car_polygons:
#                             pos = json.loads(data[left]['position'])
#                             point1 = Point(pos['x'],pos['y'])
#                             if Polygon(polygon).contains(point1):
#                                 print(file_name+"该车存在长时间停车行为")
#                                 print(data[left]['time_meas'],data[j-1]['time_meas'],interval_time)
#                                 break
                                
#                     break
#         else:
#             i+=1
                    
    # count+=1
    # if count>600:
    #     break           
                           
                            
                            
                    
                    