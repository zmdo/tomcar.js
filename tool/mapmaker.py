from PIL import Image
import numpy as np

mapImage = Image.open('./map.png')
mapImageArray = np.array(mapImage)

rows,cols,channel = mapImageArray.shape
binArray = np.zeros((rows, cols), dtype=int)

for i in range(rows):
    for j in range(cols):
        r = mapImageArray[i,j,0]
        g = mapImageArray[i,j,1]
        b = mapImageArray[i,j,2]
        if (r > 0 and g == 0 and b == 0):
            binArray[i,j]=1
        else:
            binArray[i,j]=0

output = []
zeros = 0
ones = 0
for i in range(rows):
    ###
    if (i < cols and binArray[i,0] == 0):
        output += [0]
    else :
        output += [-1]
    ###
    for j in range(cols):
        if (binArray[i,j] == 0) :
            zeros = zeros + 1
            if (ones > 0 ):
                output += [ones]
                ones = 0
        else :
            ones = ones + 1
            if (zeros > 0 ):
                output += [zeros]
                zeros = 0
    ###
    if (zeros > 0) :
        output += [zeros]
        zeros = 0
    elif (ones > 0) :
        output += [ones]
        ones = 0

print(output)
np.savetxt("map.txt",np.asarray(output),fmt='%d',delimiter=',')

