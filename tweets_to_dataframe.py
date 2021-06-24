import requests
import pandas as pd
import numpy as np
import sys
import time
import os
import json
from collections import Counter
import argparse
import matplotlib.pyplot as plt
import seaborn as sns

class Program():

    def __init__(self) -> None:
        self.server = 'http://localhost:2900/tweets'

    def connect_to_and_get(self,server):
        
        try:

            resp = requests.get(server)  # GET request
            if not resp:
                print("Did not get anything")
            if resp.status_code == 200:
                print(f"succesfully connected to {server} --- status_code: {resp.status_code}")
                time.sleep(5)
                return resp.json()

            if resp.status_code == 401:
                print(f"Not authorized to access {server}, errorcode {resp.status_code}")

            if resp.status_code == 403:
                print(f"server {server} refused, errorcode: {resp.status_code}")

            if resp.status_code == 500:
                print(f"Server {server} not running, errorcode: {resp.status_code}")

        except requests.exceptions.ConnectionError as e:
            print("Server not running, starting it")

            os.startfile(r"C:\Users\konst\Dropbox\Programmeren\PYTHON\Data_analyse\CRYPTO\startserver.bat")
            time.sleep(10)

            print("Connecting to server.......")
            return self.connect_to_and_get(server)
    

    def write_to_file(self,data_file):
        if not data_file:
            data = self.connect_to_and_get(self.server)
        else: data = data_file
        with open('data.json', 'w') as f:
            json.dump(data, f)
        return " written file"

    def process(self):
        df = pd.DataFrame()
        file = os.getcwd() + '\\data.json'
        if os.path.isfile(file) and os.access(file, os.R_OK):
                # checks if file exists
            print ("File exists and is readable")
            with open(file) as jsonFile:
                data = json.load(jsonFile)
                jsonFile.close()
        else:
            data = self.connect_to_and_get(self.server)
            self.write_to_file(data)
        
        # transforming data to add counts
        for d in data:
            data[d] = {x:data[d].count(x) for x in data[d]}
        return data

    #to dataframe
    def to_df(self,data=None,drop=True):
            if not data:
                data = self.process()
            df = pd.DataFrame.from_dict({i: data[i] 
                           for i in data.keys()},orient='index')
            df.index = pd.to_datetime(df.index)
            df.columns = map(str.upper, df.columns.str[1:])
            if drop:
                df.dropna(axis=1, how='all')

            return df


        #plotting dataframe
    def analyze_df(self):
            df = self.to_df()
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
    
    def execute(self,mode):
        if mode == 'df':
            print(self.to_df())
        elif mode == 'refresh':
            self.connect_to_and_get()
        elif mode == 'an':
            self.analyze_df()
        elif mode == 'tm':
            self.top_mentioned()


if __name__ == '__main__':
    try:          
        parser = argparse.ArgumentParser(description='Program to get latest (+historic) twitter trends')
        parser.add_argument('--mode','-m', type=str,
                            help='select a mode to execute \n(df=get dataframe), \nrefresh = refresh data, \nan= analyze data \n, tm = view top mentioned' ,required=True)
       
        args = parser.parse_args()
        Program().execute(mode=args.mode)
        

    except KeyboardInterrupt:
        os.system('cmd /k "taskkill /im node.exe /F" ')
        print("closing server if running and closing program")
        sys.exit(0)
