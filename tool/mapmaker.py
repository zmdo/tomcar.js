from PIL import Image
import numpy as np

# load image file
mapImage = Image.open('./map.png')
mapImageArray = np.array(mapImage)


rows = 500
cols = 500

# read map image pixels
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

# compress data
output = []
zeros = 0
ones = 0
for i in range(rows):
    output += [0]
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

np.savetxt("default.map",np.asarray(output[1:]),fmt='%d',delimiter=',',newline=',')