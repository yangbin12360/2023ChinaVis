from flask import Flask, request
from flask_cors import CORS
import json
import numpy as np
import os
import datetime
import pandas as pd
import math
app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/helloReact',methods=["POST"])
def helloReact():
    return 'rrr react.'

@app.route('/getJson',methods=["POST"])
def getJson():
    mapName = ['boundary','crosswalk','lane','signal','stopline']
    res = {}
    for name in mapName:
        with open('../back\static\data\ChinaVis Data/road10map/'+name+'road10.geojson', 'r', encoding='utf-8') as f:
            data = json.load(f) 
        res[name] = data
    with open('../back/static/data\DataProcess/1/171547107.json ')as f:
        data1 = json.load(f)
    with open('../back/static/data\DataProcess/6/188078451.json ')as f:
        data2 = json.load(f)
    #时间戳排序
    res["car"] = sorted(data1, key=lambda x: x['time_meas'])
    res["car2"] = sorted(data2, key=lambda x: x['time_meas'])
    return res

@app.route('/getList',methods=["POST"])
def getList():
   
    with open('../back/static/data/DataProcess/merged_data.json ')as f:
        data = json.load(f)
        res = data[0]+data[1]+data[2]+data[3]+data[4]+data[5]+data[6]+data[7]
        # print(data)
    #时间戳排序
    return res

#按照时间戳获取交通参与者数据
@app.route('/getTimeJson',methods=["POST"])
def getTimeJson():
    startTime = request.json.get('startTime')
    pathList = []
    # startTime = 1681315196
    for i in range(0,300):
        fileName = str(i+startTime)+'.0.json'
        pathList.append(fileName)
    res = {}
    for path in pathList:
        with open('../back/static/data\DataProcess/time_meas/'+path)as f:
            data = json.load(f)
            # 遍历数据，根据id进行分组
            for item in data:
                if item['type'] != -1 :  
                    id = item.get('id')  
                    if id not in res:
                        res[id] = []
                    res[id].append(item)
    # 对每个id对应的数据列表按照time_meas进行排序
    for id in res:
        res[id].sort(key=lambda x: x['time_meas'])  
    newRes = {}
    def calculate_average(lst):
        if len(lst) == 0:
            return 0  # 如果列表为空，则返回0或者其他你认为合适的默认值
        else:
            average = sum(lst) / len(lst)
            return round(average, 2)
    # 每个id对应的position、shape、orientation、velocity、heading、type放入
    for id in res:
        pList = []
        oList = []
        vList = []
        hList = [] 
        newRes[id]={}
        for item in res[id]:
            pList.append(item["position"])
            oList.append(item["orientation"])
            vList.append(item["velocity"])
            hList.append(item["heading"])
            newRes[id]["shape"] = item["shape"]
            newRes[id]["type"] = item["type"]
        v_meas = calculate_average(vList)
        newRes[id]["trace"] = pList
        newRes[id]["orientation"] = oList
        newRes[id]["velocity"] = v_meas
        newRes[id]["heading"] = hList
    for id in res:
        newRes[id]["startTime"] = res[id][0]["time_meas"]
        newRes[id]["endTime"] = res[id][-1]["time_meas"]
    return newRes
    
@app.route('/getActionAndRoadCount',methods=["POST"])
def getActionAndRoadCount():
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    num_segments = 288  # 时间段数量
    # 创建一个三维数组
    all_count = [[[0 for _ in range(num_segments)] for _ in range(9)] for _ in range(8)]

    file_path = './static/data/Result/decomposition_data.json'
    with open(file_path, "r", encoding="utf-8") as f:
        decomposition_data = json.load(f)
    for index,d_data in enumerate(decomposition_data):
        if index in [1,2,3,4]:
            for item in d_data:
                if item['road']==-1:
                    continue
                # 将时间戳转换为日期时间
                dt1 = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
                dt2 = datetime.datetime.fromtimestamp(item['end_time'] / 1000000)
                time_diff1 = dt1 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index1 = int(time_diff1.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                time_diff2 = dt2 - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index2 = int(time_diff2.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                if segment_index1==segment_index2:
                    all_count[index][item['road']][segment_index1]+=1
                else:
                    all_count[index][item['road']][segment_index1]+=1
                    if segment_index2>287:
                        # print(segment_index2,dt2)
                        all_count[index][item['road']][287]+=1
                    else:
                        all_count[index][item['road']][segment_index2]+=1 
        else:
            for item in d_data:
                if item['road']==-1:
                    continue
                # 将时间戳转换为日期时间
                dt = datetime.datetime.fromtimestamp(item['start_time'] / 1000000)
                time_diff = dt - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
                segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
                all_count[index][item['road']][segment_index]+=1
                
                
    # print(all_count)
    # list_path = './static/data/Result/all_list.json'
    # with open(list_path, 'w') as f:
    #     json.dump(all_count, f)                  
    return all_count

# def getActionAndRoadCount():
#     file_path = './static/data/Result/all_list.json'
#     with open(file_path, "r", encoding="utf-8") as f:
#         data = json.load(f)
#     return data

@app.route('/getLittleRoadFlow',methods=["POST"])
def getLittleRoadFlow():
    startTime = request.json.get('startTime')
    segment_duration = datetime.timedelta(minutes=5)
    file_path = './static/data/Result/little_road_flow_new.json'
    with open(file_path, "r", encoding="utf-8") as f:
        little_flow = json.load(f)
    # 将时间段的起始时间和结束时间转换为 datetime 对象
    startTime = datetime.datetime.fromtimestamp(startTime)
    time_diff = startTime - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
    segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
    if segment_index>287:
        segment_index=287
    return little_flow[segment_index]
    

#按照时间戳获取高价值场景数据
@app.route('/getHighValue',methods=["POST"])
def getHighValue():
    startTime = request.json.get('startTime')
    file_name = os.listdir('../back/static/data/DataProcess/highSceneCsv')
    file = '../back/static/data/DataProcess/highSceneCsv'
    res = {}
    endTime = startTime+300
    startTime = startTime*1000000
    endTime = endTime*1000000
    for name in file_name:
        file_path = os.path.join(file,name)
        df = pd.read_csv(file_path)
        selected_rows = df[(df['start_time'] >= startTime) & (df['start_time'] <= endTime)]
        resName = name.split('.')[0]
        res[resName] = selected_rows.to_dict('records')
    newRes = {}
        # 遍历 res 中的每个关键字和对应的列表
    for keyword, lst in res.items():
        newRes[keyword] = []
        # 遍历列表中的每个字典
        for dictionary in lst:
            # 获取每个字典下的 'id'、'type'、'action_name' 和 'start_time' 键对应的值
            id_value = dictionary['id']
            type_value = dictionary['type']
            action_name_value = dictionary['action_name']
            start_time_value = dictionary['start_time']

            # 将这四个键和对应的值组成一个新的字典，并添加到 newRes 中
            new_dictionary = {
                'id': id_value,
                'type': type_value,
                'hv_type': action_name_value,
                'start_time': start_time_value
            }
            newRes[keyword].append(new_dictionary)
    return newRes


#按照id获取高价值场景数据
@app.route('/getIdHighValue',methods=["POST"])
def getIdHighValue():
    id = request.json.get('id')
    type = request.json.get('type')
    init_time = 1681315196  # 初始时间

    # 获取车道号
# 获取车道号
    def find_keys(laneDict, values):
        keys = []
        for key in laneDict:
        # 将字典中的元素转换为字符串
            str_values = []
            for value in laneDict[key]:
                tempStr =str(value)
                if tempStr.find('.')!=-1:
                    tempStr=tempStr.split('.')[0]
                str_values.append(tempStr)
            for value in values:
                if value in str_values and key not in keys:
                    keys.append(key)
        return keys
    tfPath = "../back/static/data/DataProcess/trafficFlow/little_road_flow.json"
    with open(tfPath,"r") as f:
        tfData = json.load(f)
    # tfData[车道号number][时间]
    hvName = ['CC','LT','NC','OS','PC','REV','SD','SU']
    laneDict = {
  "left_l":["1912", "1911", "1910_2", "1910_1"],
  "left_r":["1898_1", "1898_2", "1900", "1901"],
  "bottom_l":["1957_4", "1957_3", "1956", "1955"],
  "bottom_r":["1934", "1935", "1936_3", "1936_4"],
  "right_l":["1450", "1449", "1448", "1447", "1446"],
  "right_r":["1442", "1443", "1444", "1445"],
  "top_l":["1974", "1973", "1972"],
  "top_r":["1975_1", "1975_2", "1977", "1978"],
}
    laneYList = [
  "1912", "1911", "1910_2", '1910_1',
  "1898_1", "1898_2", "1900", "1901",
  "1957_4", "1957_3", "1956", "1955",
  "1934", "1935", "1936_3", "1936_4",
  "1450", "1449", "1448", "1447", "1446",
  "1442", "1443", "1444", "1445",
  "1974", "1973", "1972",
  "1975_1", "1975_2", "1977", "1978"
];
    lanNumber= {
    "left_l":[0,1,2,3],
    "left_r":[4,5,6,7],
    "bottom_l":[8,9,10,11],
    "bottom_r":[12,13,14,15],
    "right_l":[16,17,18,19,20],
    "right_r":[21,22,23,24],
    "top_l":[25,26,27],
    "top_r":[28,29,30,31]
    }
    file_name = os.listdir('../back/static/data/DataProcess/highSceneCsv')
    file = '../back/static/data/DataProcess/highSceneCsv'
    res = {}
    tempDict = {}
    hvCount = [] #高价值场景数量，对应bar图
    # 定义一个自定义函数，用于除以1000000
    def divide_by_1000000(value):
        return int(value / 1000000)
    hvForNum = 0
    for name in file_name:
        file_path = os.path.join(file,name)
        df = pd.read_csv(file_path)
        selected_rows = df[(df['id'] == id)]
        newTempDict = {}
        newTempDict["sceneType"] =hvName[hvForNum]
        hvForNum+=1
        newTempDict["count"]= len(df[(df['id'] == id)])
        hvCount.append(newTempDict)
        selected_rows['start_time'] = selected_rows['start_time'].apply(divide_by_1000000)
        resName = name.split('.')[0]
        tempDict[resName] = selected_rows['start_time'].tolist()
        res[resName] = selected_rows.to_dict('records')
    # timeStampList = sorted(timeStampList)
    # print(tempDict)
    # 获取高价值场景的时间戳列表及详细属性
    def transform_data(original_data):
        new_data = []
        for key, values in original_data.items():
            for value in values:
                new_value = value.copy()  
                new_value['action_name'] = key
                new_data.append(new_value)
        return new_data

    newRes = {}
    newRes["highValue"] = transform_data(res)
    # newRes["highValue"] = res #高价值场景数据
    newRes["hvCount"] = hvCount #高价值场景数量
    file_name_id = "../back/static/data/DataProcess/idRoadCsv/"+str(type)+"/"+str(id)+".csv"
    with open(file_name_id,"r") as f:
        data = pd.read_csv(f)
    velocityList = [] #速度折线图列表，还需要除以5,以获得每秒的平均速度
    # print(data.iloc[0:]["lineFid"].to_list())
    laneRoadList = list(set(data.iloc[0:]["lineFid"].to_list())) #所在车道列表，对应轨迹
    print("laneRoadList",laneRoadList)
    # 获取中车道的键名
    keys = find_keys(laneDict, laneRoadList)
    print("keys",keys)
    #获取到了flow文件中的车道号值了
    values = [value for key in keys for value in lanNumber[key]]
    print("values",values)
    testList = []
    for index, row in data.iterrows():
        velocityList.append(row['velocity'])
        testList.append(int(row['time_meas']/1000000))
    differences = [testList[i+1] - testList[i] for i in range(len(testList) - 1)]
    #找到数据缺失的位置，存入indices列表中
    indices = [index for index, value in enumerate(differences) if value != 0 and value != 1]
    # print("indices ",indices ,differences[747])
    # print("testList",testList)
    def average_every_n(lst, n=5):
    # 这里我们使用列表推导式来生成新的列表
        averages = [sum(lst[i:i+n])/len(lst[i:i+n]) for i in range(0, len(lst), n)]
        return averages
    # 通过indices获得数据缺失的位置
    newVelocityList = []
    if len(indices)==0:
        newVelocityList = average_every_n(velocityList)
    else:
        for i in range(0,len(indices)):
            newVelocityList = newVelocityList+average_every_n(velocityList[0:indices[i]])
            for j in range(1,differences[indices[i]]):
                newVelocityList.append(0)
            newVelocityList = newVelocityList+average_every_n(velocityList[indices[i]:-1])
    # print("velocityList",velocityList)
    vPositionList = []
    startTime = int(data.iloc[0]["time_meas"]/1000000) #起始时间
    endTime = int(data.iloc[-1]["time_meas"]/1000000)  #结束时间 
    print("endtime",endTime)
    vListTime = startTime
    for vNum in newVelocityList:
        tempDict = {}
        tempDict["x"]=vListTime
        tempDict["y"]=vNum
        vListTime+=1
        vPositionList.append(tempDict)
    newRes["vPositionList"] = vPositionList #速度折线图位置
    # newRes["velocityList"] = velocityList #速度折线图
    laneRoadId = data.iloc[0]["lineFid"]
    # 多个流量数据判断
    allSpan = math.ceil((endTime - startTime)/300)
    timeSpan = math.floor((startTime - init_time)/300) #时间跨度,以获取流量数据
    hvPositionList = []
    # 获取高价值场景坐标点绘制,并且把高价值场景属性放进去
    for i in range(0,len(newRes["highValue"])+2):
        tempDict = {}
        if i==0:
            tempDict["x"] = startTime
            tempDict["y"] = 0
        if i==len(newRes["highValue"])+1:
            tempDict["x"] = endTime
            tempDict["y"] = hvPositionList[-1]["y"]
        if i>0 and i<len(newRes["highValue"])+1:
            tempDict["x"] = newRes["highValue"][i-1]["start_time"]
            selectRow  = data[data['time_meas'] // 1000000 == tempDict["x"]] # data是该id的所有数据
            if selectRow["lineFid"].isna().any():
                tempDict["y"] =0
            elif (selectRow["lineFid"].astype(int) > 1).all():
                tempDict["y"] = selectRow["lineFid"].iloc[0]
            else:
                tempDict["y"] = selectRow["lineFid"]
            tempDict["type"] = newRes["highValue"][i-1]["action_name"]
            tempDict["nowTime"] = newRes["highValue"][i-1]["start_time"]
        hvPositionList.append(tempDict)
    newRes["hvPositionList"] = hvPositionList #高价值场景坐标点
    flowList = []
    # 获取时间间隔内的流量
    for i in range(0,allSpan):
    # 获取车道流量
        for laneID in values:
            flow = tfData[laneID][timeSpan+i]
            flowList.append(flow)
    newRes["flowList"] = flowList #车道流量
    newRes["flowSe"] = values
    print("newRes",newRes["flowSe"])
    # 设置坐高价值场景坐标点的变化
    for i in newRes["hvPositionList"]:
        if i["y"] == 0:
            continue;
        tempStr =str(i["y"])
        if tempStr.find('.')!=-1:
            tempStr=tempStr.split('.')[0]
        newY = laneYList.index(tempStr)
        finalY = newRes["flowSe"].index(newY)
        i["y"] = finalY
    # 为变道添加坐标点
    newList = []
    iNum = 0
    for i in newRes["hvPositionList"]:
        if iNum!=0 and iNum!=len(newRes["hvPositionList"])-1:
            if i["type"] == "carCross":
                tempDict = {}
                tempDict["x"] = i["x"]
                tempDict["y"] = newRes["hvPositionList"][iNum-1]["y"]
                tempDict["type"] = "carCross"
                tempDict["nowTime"] = i["nowTime"]
                newList.append(tempDict)  
        newList.append(i)  
        iNum+=1
    newRes["hvPositionList"] = newList  
    return newRes


#按照时间戳获取每5分钟的机动车的聚类结果
@app.route('/getCluster',methods=["POST"])
def getCluster():
    time = request.json.get('startTime')
    start_time = 1681315196
    clusterTime = math.ceil(((time-start_time)/300))
    print(clusterTime)
    file_path = "../back/static/data/DataProcess/5m/merge/" 
    res ={}
    cluster_avg_values = {}
    #获取聚类结果
    dfCluster = pd.read_csv(file_path+str(clusterTime*300)+"s.csv")
    dfCluster['id'] = dfCluster['id'].astype(str)
    res["scatter"] = []
    for cluster in dfCluster['cluster'].unique():
        df_temp = dfCluster[dfCluster['cluster'] == cluster] 
        cluster_avg_values[str(cluster)] = [
             round(df_temp['a_std'].mean(), 2),
             round(df_temp['o_std'].mean(), 2),
            round(df_temp['distance_mean'].mean(), 2),
           round(df_temp['v_pca'].mean(), 2),
        ]
        for _, row in df_temp.iterrows():
            tempDict = {}
            tempDict["id"] = row['id']
            tempDict['position'] = {"x":1,"y":1}
            tempDict['position']["x"] = row['x']
            tempDict['position']["y"] = row['y']
            # res["scatter"][id_str]['position'] = [row['x'], row['y']]
            tempDict['type'] = row['type']
            tempDict['cluster'] = row['cluster']
            res["scatter"].append(tempDict)
    
    tempDict = {}
    res["radar"]=[]
    tempDict["0"] =  cluster_avg_values["0"]
    tempDict["1"] = cluster_avg_values["1"]
    tempDict["2"] = cluster_avg_values["2"]
    res["radar"].append(tempDict)
    return res  


# 按照时间戳和车道获取流量预测数据
@app.route('/getFlow',methods=["POST"])
def getFlow():
    timeStamp = request.json.get('timeStamp')
    print("timeStamp",timeStamp)
    def timeHour(time):
        # 将时间戳转换为 datetime 对象
        dt = datetime.datetime.fromtimestamp(time)
# 获取 datetime 对象的分钟数和秒数
        minutes = dt.minute
        seconds = dt.second
# 计算与上一个整点时刻和下一个整点时刻的时间差
        prev_hour = dt.replace(minute=0, second=0)
        next_hour = prev_hour + datetime.timedelta(hours=1)
        diff_prev = dt - prev_hour
        diff_next = next_hour - dt
        if diff_prev < diff_next:
            closest_hour = prev_hour
        else:
            closest_hour = next_hour
        closest_timestamp = int(closest_hour.timestamp())
        return closest_timestamp

    laneYList = [
  "1912", "1911", "1910_2", '1910_1',
  "1898_1", "1898_2", "1900", "1901",
  "1957_4", "1957_3", "1956", "1955",
  "1934", "1935", "1936_3", "1936_4",
  "1450", "1449", "1448", "1447", "1446",
  "1442", "1443", "1444", "1445",
  "1974", "1973", "1972",
  "1975_1", "1975_2", "1977", "1978"
];

    file_path ="../back/static/data/DataProcess/flowForecast/forFlow.csv"
    df = pd.read_csv(file_path)
    res={}
    indexTime = timeHour(timeStamp)
    initTime = 1681315200
    forTiems = int((indexTime-initTime)/3600)
    for i in laneYList:
        res[i] = []
        # print(initTime)
        initTime = 1681315200
        for j in range(0,forTiems):
            print("iniTime",initTime)
            tempDf = df[(df['timestamp'] == initTime) & (df['roadid'].astype(str) == i)]
            res[i]=res[i]+tempDf['TRUE'].tolist()
            initTime+=3600
    # print(df[df['roadid'].astype(str).isin(indexLaneList)])

    res["trueLane"] = {}
    # 求一小时后的预测值
    forTime = indexTime
    for i in laneYList:
        tempDf = df[(df['timestamp'] == forTime) & (df['roadid'].astype(str) == i)]
        res[i]=res[i]+tempDf['pre'].tolist()
        res[i]=res[i]+tempDf['TRUE'].tolist()
    newRes ={}
    newRes["all"] = []
    for i in laneYList:
        newRes["all"].append(res[i])
    return newRes


# 获取关于人行道的所有数据
def getCrossWalkData():
    startTime=request.json.get('startTime')
    file_path1 = './static/data/Result/people_flow.json'
    with open(file_path1, "r", encoding="utf-8") as f:
        people_flow = json.load(f)
    file_path2 = './static/data/Result/people_velocity.json'
    with open(file_path2, "r", encoding="utf-8") as f:
        people_velocity = json.load(f)
    file_path3 = './static/data/Result/crosswalkroad_high_value.json'
    with open(file_path3, "r", encoding="utf-8") as f:
        crosswalkroad_high_value = json.load(f) 
    resultData= [[] for _ in range(288)]
    for i in range(288):
        resultData[i].append(crosswalkroad_high_value[i])
        resultData[i].append(people_velocity[i])
        resultData[i].append(people_flow[i])   
    startTime = datetime.datetime.fromtimestamp(startTime)
    # 时间段时长和数量
    segment_duration = datetime.timedelta(minutes=5)  # 时间段时长为5分钟
    time_diff = startTime - datetime.datetime(2023,4,12,23,59,56)  # 计算时间戳与当天零点之间的时间差
    segment_index = int(time_diff.total_seconds() // (segment_duration.total_seconds()))  # 计算时间段索引
    if segment_index>287:
        segment_index=287
    # print(resultData[segment_index])
    return resultData[segment_index]       


if __name__ == '__main__':
    # app.debug = True   # 开启调试模式, 代码修改后服务器自动重新载入，无需手动重启
    app.run()
