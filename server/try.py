import pandas as pd
from collections import defaultdict

d =     [('2021-06-02','$BTC', 1),
            ('2021-07-02','$sqg', 2),
            ('2021-07-03','$SQG', 2),
            ('2021-06-03','$BGG', 9),
             ('2021-03-03','$BGg', 3),
             ('2021-03-03','$SQG', 5)]
             


djson = [['2021-06-02','$BTC', 1],
        ['2021-06-03','$GTD', 3],
        ['2021-06-04','$IVG', 3],
        ['2021-06-04','$KYA', 4],
        ['2021-06-08','$BTC', 5]]
       

# let final_arr = [];

# for (var key in dict) {
#     if (dict.hasOwnProperty(key)) {
#         final_arr.push( [ key, Object.keys(dict[key]).toString(),Object.values(dict[key]).toString() ] );
#     }
# }

# console.log(final_arr)

     
def to_df(data):
    # data = tuple(map(tuple, data))

    df = pd.DataFrame(data,columns=['date', 'tick', 'count'])
    df = df.pivot('date', 'tick', 'count')
    df.index = pd.to_datetime(df.index)
    df.columns = map(str.upper, df.columns.str[1:])

    return df

print(to_df(djson))