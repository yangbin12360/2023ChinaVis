import json
from shapely.geometry import LineString,Point,Polygon
import os
import json

# 判断行人是否与道路多边形是否存在交点，从而判断行人是否存在异常行为
def people_cross():
    # 获取多边形坐标数据
    file_path1 = './static/data/BoundryRoads/polygons_people.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        people_polygons = json.load(f)

    # 获取人行道坐标数据
    file_path2 = './static/data/BoundryRoads/crosswalkroad.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        crosswalkRoad = json.load(f)
    # print(crosswalkRoad)

    people_cross_data=[]
    # count=0
    folder_path = './static/data/DataProcess/2'
    # 获取文件夹中的所有文件
    file_list = os.listdir(folder_path)
    # 遍历文件列表，筛选出JSON文件并读取
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        temporary_data=[]  #临时数据，用于找时间
        track = []  #保存轨迹坐标
        time_data=[]  #保存异常行为时间段
        # num=0
        with open(file_path, 'r') as f:
            data = json.load(f)
        for item in data:
            pos = json.loads(item['position'])
            arr = []
            arr.append(pos['x'])
            arr.append(pos['y'])
            track.append(arr)#获取行人轨迹
            #保存临时数据
            temporary_data.append({
                'position':pos,
                'time_stamp':item['time_meas']
            })
        # 生成轨迹
        line_obj = LineString(track)
        
        #针对十字路口区域构建一个四边形
        center_polygon=[[-66.64,-116.48],[-23.2,-146.52],[-3.16,-103.59],[-46.99,-74.72],[-66.64,-116.48]]
        # 对处于十字路口的特殊情况
        if line_obj.intersects(Polygon(center_polygon)):
            # print(file_name+"存在")
            people_cross_data.append({
                'id':data[0]['id'],
                'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']]})#针对特殊情况，直接存入起点和终点时间
            continue

        #排除轨迹经过人行道的行为，假设这些行为都是正常的
        flag=0
        for walkroad in crosswalkRoad:
            # 定义一个Polygon
            polygon = Polygon(walkroad)
            if line_obj.intersects(polygon):
                flag=1
        
        if flag==1:
            continue        
                    
        for polygon in people_polygons:
            #如果轨迹完全处于多边形之内，则直接存入起点和终点的数据
            if line_obj.within(Polygon(polygon)):
                time_data.append(data[0]['time_meas'])
                time_data.append(data[len(data)-1]['time_meas'])
                # print(file_name)
                # print(track)
                people_cross_data.append({
                'id':data[0]['id'],
                'time_arr':time_data})
                break
            elif line_obj.intersects(Polygon(polygon)):
                # 轨迹与道路边界存在交点
                intersection_point = line_obj.intersection(Polygon(polygon).boundary)
                #交点为Point时，先计算交点时间，再判断起点或终点是否处于道路之中
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
                        #选择起点的时间
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[temporary_data[0]['time_stamp'],time1]})
                        break
                    elif Polygon(polygon).contains(point2): 
                        # num+=1
                        # time_data.append([time1,temporary_data[-1]['time_stamp']])
                        #选择终点的时间
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[time1,temporary_data[-1]['time_stamp']]})
                        break
                        #这里直接break结束循环是因为，经过多次观察发现行人轨迹不存在跨越多条道路的情况

                elif intersection_point.geom_type == 'MultiPoint':
                    #计算交点个数
                    if len(intersection_point.geoms)==2:
                        # print(len(intersection_point.geoms))
                        # print(file_name,intersection_point)
                        # print(track)
                        closest_points=[]
                        # num+=2
                        time1=0
                        time2=0
                        #如果存在两个交点，则计算两交点的时间戳
                        for inter_point in intersection_point.geoms:
                            # 计算每个点与给定点之间的距离
                            distances = [inter_point.distance(Point(coord)) for coord in track]
                            # 找到距离最短的点
                            min_dist_index = distances.index(min(distances))
                            closest_point = track[min_dist_index]
                            closest_points.append(closest_point)
                        #寻找高价值场景发生的时间戳    
                        for d in temporary_data:
                            if closest_points[0][0]==d['position']['x'] and closest_points[0][1]==d['position']['y']:
                                time1=d['time_stamp']
                                break
                        for d in temporary_data:
                            if closest_points[1][0]==d['position']['x'] and closest_points[1][1]==d['position']['y']:
                                time2=d['time_stamp']
                                break 
                        if time1>time2:   
                            #time_data.append([time1,time2]) 
                            people_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time1,time2]})
                            break
                        else:
                            # time_data.append([time2,time1]) 
                            people_cross_data.append({
                            'id':data[0]['id'],
                            'time_arr':[time2,time1]})
                            break
                            #这里直接break结束循环是因为，经过多次观察发现行人轨迹不存在跨越多条道路的情况
                    else:
                        # print(file_name)
                        # print(track)
                        people_cross_data.append({
                        'id':data[0]['id'],
                        'time_arr':[temporary_data[0]['time_stamp'],temporary_data[-1]['time_stamp']]})
                        break
                        #这里直接break结束循环是因为，经过多次观察发现这里的行人轨迹大多直接处于道路之中
        
        # if num>0: 
        #     # print("存在")           
        #     people_cross_data.append({
        #         'id':data[0]['id'],
        #         'count':len(time_data),
        #         'time_arr':time_data
        #     })                         
        
    people_cross_path = './static/data/DataResult/people_cross.json'
    with open(people_cross_path, 'w') as f:
        json.dump(people_cross_data, f)


        # print(people_cross_data)  
        # count+=1
        # if count>100:
        #     print(people_cross_data)
        #     break    

if __name__ == '__main__':
  people_cross()
