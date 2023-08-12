import os
import re
import json
import copy

# Mapファイルが保存されているフォルダのパス(相対パスにしたい)
input_folder_path = "./data"

# 結合したテキストファイルを保存するパス(相対パスにしたい)
output_file_path = "data/RegionMapMove.json"

# MapInfosファイルが保存されているフォルダのパス(相対パスにしたい)
mapinfos_path = "./data/MapInfos.json"

mapinfos = None

json_data = None

with open(mapinfos_path, 'r', encoding='utf-8') as file:
    json_data = file.read()

mapinfos = json.loads(json_data)

maplinks = {}
mapends = []

for mapId in range(1, len(mapinfos)):
    mapInfo = mapinfos[mapId]
    parentId = mapInfo["parentId"]
    
    if parentId > 0:
        if parentId not in maplinks:
            maplinks[parentId] = []
        maplinks[parentId].append(mapId)

for mapId in range(1, len(mapinfos)):
    if mapId not in maplinks:
        mapends.append(mapId)
    
# print(maplinks)


pattern = re.compile(r'^Map\d{3}\.json$')

map_files = [file for file in os.listdir(input_folder_path) if pattern.match(file)]

mapregions = {}

for num, map_file in enumerate(map_files, start=1):
    file_path = os.path.join(input_folder_path, map_file)
    mapregions[num] = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        map_data = json.load(f)
        if map_data["events"]:
            h = map_data["height"]
            w = map_data["width"]
            z = 5 # map layer region 
            for event in map_data["events"]:
                if not event:
                    continue

                x = event["x"]
                y = event["y"]
                region = map_data["data"][ x + ( y + z * h ) * w]

                if region > 0:
                    mapregions[num][region] = {'x': x, 'y': y}

mapmoves = {i: {} for i in range(1,len(mapinfos))}
mapregions_org = copy.deepcopy(mapregions)
next_mapregions = copy.deepcopy(mapregions)

while (maplinks):

    next_mapends = []

    for mapId in mapends:
        if mapId not in maplinks:

            pId = mapinfos[mapId]["parentId"]
            
            if pId == 0 or mapId == 0:
                continue
            if mapId not in maplinks[pId]:
                continue
            
            maplinks[pId].remove(mapId)
                
            if not maplinks[pId]:
                maplinks.pop(pId)
                next_mapends.append(pId)
            
            if not mapregions[mapId]:
                continue

            for region_num in mapregions[mapId]:
                if region_num in mapregions[pId]:
                    mapmoves[mapId][region_num] = {'id':pId,'x':mapregions_org[pId][region_num]["x"],'y':mapregions_org[pId][region_num]["y"]}
                    mapmoves[pId][region_num] = {'id':mapId,'x':mapregions_org[mapId][region_num]["x"],'y':mapregions_org[mapId][region_num]["y"]}
                    next_mapregions[mapId].pop(region_num)
                    next_mapregions[pId].pop(region_num)

    mapregions = copy.deepcopy(next_mapregions)
    mapends = next_mapends

# print(mapmoves)

with open(output_file_path, 'w') as f:
    json.dump(mapmoves, f, indent=2)            

        # print(map_data)
        # ここでmap_dataを使用して何かしらの処理を行う