import json
import os

merged_data=[]
folder_path = './static/data/DataResult'
# 获取文件夹中的所有文件
file_list = os.listdir(folder_path)
# 遍历文件列表，筛选出JSON文件并读取
num=0
for file_name in file_list:
    file_path = os.path.join(folder_path, file_name)
    with open(file_path, 'r') as f:
        data = json.load(f)
    if file_name=='people_cross.json':
        for item in data:
            item["type"]=2 
            item["aid"]=num  
    elif file_name=='nomotor_cross.json':
        for item in data:
            item["type"]=3 
            item["aid"]=num
    else:
        for item in data:
            item["aid"]=num
    merged_data.append(data) 
    num+=1
merge_path = './static/data/DataResult/merged_data.json'
with open(merge_path, 'w') as f:
    json.dump(merged_data, f)      