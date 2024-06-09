import math;

def bin_s(val, array):
    l = 0
    h = len(array)-1

    while (l <= h):
        m = math.floor((l+h)/2)
        if(array[m] == val):
            return m
        elif (val > array[m]):
            l = m + 1
        else:
            h = m - 1

    return -1000

def found_it(val, idx, array):
    if(idx > len(array) - 2):
        return False

    if(array[idx] <= val and array[idx + 1] > val):
        return True
    else:
        return False

def bin_min(val, array):
    l = 0
    h = len(array)-1

    while (l <= h):
        m = math.floor((l+h)/2)
        if(found_it(val, m, array)):
            return m
        elif (val > array[m]):
            l = m + 1
        else:
            h = m - 1

    return -1000

array = [10, 20, 30]
val = bin_min(5, array)
print("val = " + str(val))





