import json
from shapely.geometry import LineString,Point,Polygon
import os
import json

# 判断行人是否与边界线存在交点
def nomotor_cross():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        nomotor_polygons = json.load(f)

    # 获取人行道坐标数据
    file_path2 = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)


    nomotor_cross_data=[]
    # count=0
    root_folder_path = './static/data/DataProcess'
    # 遍历根文件夹
    for folder_name in os.listdir(root_folder_path):
        folder_path = os.path.join(root_folder_path, folder_name)
        # 判断是否为需要处理的文件夹
        if not os.path.isdir(folder_path) or folder_name not in ['3','10']:#非机动车才被检测
            continue
        # 获取文件夹中的所有文件
        file_list = os.listdir(folder_path)
        # 遍历文件列表，筛选出JSON文件并读取
        for file_name in file_list:
            file_path = os.path.join(folder_path, file_name)
            temporary_data=[]  #临时数据，用于找时间
            track = []
            time_data=[]
            # num=0
            with open(file_path, 'r') as f:
                data = json.load(f)
            for item in data:
                pos = json.loads(item['position'])
                arr = []
                arr.append(pos['x'])
                arr.append(pos['y'])
                track.append(arr)   #获取非机动车轨迹
                temporary_data.append({
                    'position':pos,
                    'time_stamp':item['time_meas']
                })
            # 生成轨迹
            line_obj = LineString(track)

            #排除人行道行为
            flag=0
            for walkroad in crosswalkRoad:
                # 定义一个Polygon
                apolygon = Polygon(walkroad)
                if line_obj.intersects(apolygon):
                    flag=1
            
            if flag==1:
                continue        
                        
            for polygon in nomotor_polygons:
                if line_obj.within(Polygon(polygon)):
                    time_data.append(data[0]['time_meas'])
                    time_data.append(data[len(data)-1]['time_meas'])
                    nomotor_cross_data.append({
                    'id':data[0]['id'],
                    'time_arr':time_data})
                    break
                elif line_obj.intersects(Polygon(polygon)):
                    # print(file_name)
                    # print(track)
                    # 两者存在交点
                    intersection_point = line_obj.intersection(Polygon(polygon).boundary)
                    if intersection_point.geom_type == 'Point':
                        # 计算每个点与交点之间的距离
                        distances = [intersection_point.distance(Point(coord)) for coord in track]
                        # 找到距离最短的点
                        min_dist_index = distances.index(min(distances))
                        closest_point = track[min_dist_index]
                        time1=0
                        for d in temporary_data:
                            if closest_point[0]==d['position']['x'] and closest_point[1]==d['position']['y']:
                                time1=d['time_stamp']
                                break 
                        # 判断点是否在多边形内
                        # 构造起点和终点
                        point1 = Point(track[0][0],track[0][1])
                        point2 = Point(track[-1][0],track[-1][1])
                        if Polygon(polygon).contains(point1):
                            # num+=1
                            # time_data.append([temporary_data[0]['time_stamp'],time1]) 
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[temporary_data[0]['time_stamp'],time1]})
                            break
                        elif Polygon(polygon).contains(point2): 
                            # num+=1
                            # time_data.append([time1,temporary_data[-1]['time_stamp']])
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time1,temporary_data[-1]['time_stamp']]})
                            break

                    elif intersection_point.geom_type == 'MultiPoint':
                        #计算次数
                        if len(intersection_point.geoms)==2:
                            # print(file_name)
                            # print(len(intersection_point.geoms))
                            # print(track)
                            closest_points=[]
                            time1=0
                            time2=0
                            # num+=2
                            for inter_point in intersection_point.geoms:
                                # 计算每个点与给定点之间的距离
                                distances = [inter_point.distance(Point(coord)) for coord in track]
                                # 找到距离最短的点
                                min_dist_index = distances.index(min(distances))
                                closest_point = track[min_dist_index]
                                closest_points.append(closest_point)
                            #寻找高价值场景发生时间    
                            for d in temporary_data:
                                if closest_points[0][0]==d['position']['x'] and closest_points[0][1]==d['position']['y']:
                                    time1=d['time_stamp']
                                    break
                            for d in temporary_data:
                                if closest_points[1][0]==d['position']['x'] and closest_points[1][1]==d['position']['y']:
                                    time2=d['time_stamp']
                                    break 
                            if time1>time2:   
                                # time_data.append([time1,time2]) 
                                nomotor_cross_data.append({
                                'id':data[0]['id'],
                                'time_arr':[time1,time2]})
                                break
                            else:
                                # time_data.append([time2,time1]) 
                                nomotor_cross_data.append({
                                'id':data[0]['id'],
                                'time_arr':[time2,time1]})
                                break
                        else:
                            # print(file_name)
                            # print(track)
                            nomotor_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']]})
                            break
            
            # if num>0: 
            #     # print("存在")           
            #     nomotor_cross_data.append({
            #         'id':data[0]['id'],
            #         'count':len(time_data),
            #         'time_arr':time_data
            #     })                         

    nomotor_cross_path = './static/data/DataResult/nomotor_cross.json'
    with open(nomotor_cross_path, 'w') as f:
        json.dump(nomotor_cross_data, f)

            # count+=1
            # if count>400:
            #     # print(nomotor_cross_data)
            #     break   

if __name__ == '__main__':
  nomotor_cross()