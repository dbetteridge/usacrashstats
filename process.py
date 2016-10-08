import pandas as pd
import dictionaries
from flask import Flask
from flask import render_template
import json
import glob

def processData():
    accidents = pd.read_csv("./data/ACC_AUX.CSV")

    persons = pd.read_csv("./data/PER_AUX.CSV")

    vehicles = pd.read_csv("./data/VEH_AUX.CSV")

    accident = pd.read_csv("./data/accident.csv")

    df = accidents.merge(persons, how='left', on='ST_CASE')

    df = df.merge(vehicles, how='left', on='ST_CASE')
    df = df.merge(accident,how='left', on='ST_CASE')
    print(df.columns)
    df.drop_duplicates(subset='ST_CASE', inplace=True)
    cols_to_keep = ['ST_CASE','STATE_x', 'A_AGE3']

    df_clean_age = df[cols_to_keep].dropna()
    cols_to_keep = ['ST_CASE','STATE_x','LATITUDE','LONGITUD']
    df_clean_loc = df[cols_to_keep].dropna()
    cols_to_keep = ['ST_CASE','STATE_x','HOUR','MINUTE']
    df_clean_time = df[cols_to_keep].dropna()

    f = open('./age.json', 'w')
    f.write(df_clean_age.to_json(orient='records'))

    f2 = open('./loc.json','w')
    f2.write(df_clean_loc.to_json(orient='records'))

    f3 = open('./time.json','w')
    f3.write(df_clean_time.to_json(orient='records'))

def createUSA():
    newfile = open('./data/USA/total.geo.json', 'w')
    for filename in glob.glob('./data/USA/*.geo.json'):
        newfile.write(open(filename).read())
    newfile.close()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/age")
def age():
    fo = open('./age.json','r')
    return fo.read()

@app.route("/loc")
def loc():
    fo = open('./loc.json','r')
    return fo.read()

@app.route("/time")
def time():
    fo = open('./time.json','r')
    return fo.read()

@app.route("/States")
def files():    

    usafile = open('./data/total.geo.json','r')    
    return usafile.read()

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)