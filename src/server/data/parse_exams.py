
import json as j

with open("cloudpractitioner.json","r") as f:
    l = j.load(f)

    for dict in l:
        temp = dict["categor"]
        dict["category"] = temp
        del dict["categor"]

with open("cloudpractitioner.json","w") as f:
    j.dump(l,f,indent=4)
