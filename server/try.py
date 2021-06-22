import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt


# test datasets
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
       


# add to javacript
# let final_arr = [];

# for (var key in dict) {
#     if (dict.hasOwnProperty(key)) {
#         final_arr.push( [ key, Object.keys(dict[key]).toString(),Object.values(dict[key]).toString() ] );
#     }
# }

# console.log(final_arr)

#to dataframe
def to_df(self,data):
    # data = tuple(map(tuple, data))

    df = pd.DataFrame(data,columns=['date', 'tick', 'count'])
    df = df.pivot('date', 'tick', 'count')
    df.index = pd.to_datetime(df.index)
    df.columns = map(str.upper, df.columns.str[1:])

    return df

print(to_df(djson))


#plotting dataframe
def analyze_df(self,df):
    df = df.melt(df.reset_index(), id_vars='index', var_name='tickers',  value_name='counts')

    g = sns.catplot(x="index", y="counts", hue='tickers', data=df, kind='point')
    plt.show()

    return 

def top_mentioned(self,df,days,max=False):
    df_change = df.apply(lambda x: x/x.shift(1).fillna(0))
    df_change = df_change(days)
    max_change = df_change.max(axis=1)

    if max:
        return f' max change occurred on {max_change} for coin {df_change.idxmax(axis=1)}'
    max_value = df_change.apply(lambda x: x.argmax(), axis=1)
    print(f' max change = {max_value}')
    return df_change
