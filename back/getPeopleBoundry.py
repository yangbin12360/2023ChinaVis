import json
from shapely.geometry import LineString,MultiLineString
from shapely.ops import linemerge
from shapely.ops import polygonize


#将总共8条道路模拟成多边形
def get_people_Boundry():
    all_polygons=[]
    file_path='./static/data/ChinaVis Data/road10map/boundaryroad_people1.geojson'
    #遍历边界geojson数据，找出坐标
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data['features']
    boundryRoad = []
    for feature in features:
        geometry = feature['geometry']
        fid = feature['properties']['fid']
        if geometry['type'] == 'LineString':
            coordinates = []
            for coordinate in geometry['coordinates']:
                x = coordinate[0]
                y = coordinate[1]
                arr = []
                arr.append(x)
                arr.append(y)
                coordinates.append(arr)
                #将坐标存入列表，形成轨迹线
            boundryRoad.append({
                'fid':fid,
                'coordinates':coordinates
            })
    
    #第一个多边形        
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [2098,2562,2566,2572,2577,70802]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [70806,2573,2567,2563,2559,2095]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    #新增两条线用来闭合多边形
    new_line1 = LineString([(-135.6064395043,-350.8889079756), (-147.8130268923,-346.1381993103)])
    new_line2 = LineString([(-49.7000147442,-139.1845326048), (-58.8520435676,-134.8349823785,)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords]) 
    # print([list(coord) for coord in polygon[0].exterior.coords]) 
    # print(all_polygons)      
    
    
    
    #第二个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [2090,2085,2079,2074,2070,2066,70808]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [70810,2069,2073,2077,2084,2089,2094]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(-46.3328911412,-142.5103418792), (-35.1385160718,-149.8620882007)])
    new_line2 = LineString([(-130.9738969629,-351.1326432496), (-121.7188209441,-355.3959214054)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    #print([list(coord) for coord in polygon[0].exterior.coords])
    
    
    
    #第三个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [2597,2603,2608,70799]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [2594,2598,2604,70796]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(-59.7112487607,-77.8779703364), ( -64.4280725536,-86.8583077487)])
    new_line2 = LineString([(-229.8843439175,27.4060393564), (-234.2738679262,15.252095011)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    #print([list(coord) for coord in polygon[0].exterior.coords])
    
    
    
    #第四个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [2589,2584,2578,70794]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [70792,2583,2588,2593]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(-65.7896298383,-90.5211075637), (-71.6224166064,-101.768722395)])
    new_line2 = LineString([(-235.5112315178,11.3954260819), (-240.5731025918,2.6856144015)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    #print([list(coord) for coord in polygon[0].exterior.coords])
    
    
    
    #第五个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1689,5246]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1685,5242]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(-35.929558242,-70.4801425607), (-24.7769278378,-77.8557513969)])
    new_line2 = LineString([(24.3927752072,29.8864851561), (15.5076317053,35.6514968701)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    # print([list(coord) for coord in polygon[0].exterior.coords])
    
    
    #第六个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1681,1684]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    new_line1 = LineString([( -21.4169501531,-80.904564355), ( -12.3928360636,-85.6810208172)])
    new_line2 = LineString([(102.8012935529,132.1931159146), (93.2552832535,135.872040537)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([polygons[0],polygons[1],new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    # print([list(coord) for coord in polygon[0].exterior.coords])
    
    #第七个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1680,1675,1904]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1676,1671,1900]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(3.9881766335,-114.784009711), (-1.9936909466,-126.5361033614)])
    new_line2 = LineString([(94.513696073,-189.150043638), (100.7203263401,-177.5976125382)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    # print([list(coord) for coord in polygon[0].exterior.coords])
    
    
    #第八个多边形
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1665,1894]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line1 = linemerge(multi_line)       
    
    polygons=[] 
    for boundry in boundryRoad:
        if boundry['fid'] in [1670,1899]:
            line=LineString(boundry['coordinates'])
            polygons.append(line) 
    # 将三条线段组合成 MultiLineString 对象
    multi_line = MultiLineString(polygons)  
    # 将相交的线段合并成一条更长的线段
    merged_line2 = linemerge(multi_line)      
    
    new_line1 = LineString([(-3.7004319466,-130.0160061874), (-11.1173687267,-144.4515544532)])
    new_line2 = LineString([(85.592182908,-207.194765587), (93.247235214,-192.904865557)])
    # 将两条线段组合成一个多边形
    polygon = polygonize([merged_line1,merged_line2,new_line1,new_line2])
    
    # 保存多边形坐标列表
    all_polygons.append([list(coord) for coord in polygon[0].exterior.coords])  
    #print([list(coord) for coord in polygon[0].exterior.coords])
    
    # 将列表保存为JSON格式的字符串
    json_string = json.dumps(all_polygons)       

    # 打开文件并写入JSON字符串
    with open('./static/data/BoundryRoads/'+'polygons_people'+ ".json", 'w') as f:
        f.write(json_string)      
        
        
if __name__ == '__main__':
  get_people_Boundry()          