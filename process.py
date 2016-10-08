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


    df = accidents.merge(persons, how='left', on='ST_CASE')

    df = df.merge(vehicles, how='left', on='ST_CASE')
    cols_to_keep = ['STATE', 'A_AGE3']

    df_clean = df[cols_to_keep].dropna()
    f = open('./data.json', 'w')
    f.write(df_clean.to_json(orient='records'))

def createUSA():
    newfile = open('./data/USA/total.geo.json', 'w')
    for filename in glob.glob('./data/USA/*.geo.json'):
        newfile.write(open(filename).read())
    newfile.close()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    fo = open('./data.json','r')
    return fo.read()

@app.route("/States")
def files():    

    usafile = open('./data/total.geo.json','r')    
    return usafile.read()

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)