import pandas as pd
from sklearn.manifold import MDS
import matplotlib.pyplot as plt
import numpy as np
import os
import matplotlib
from flask import Flask
from sklearn.preprocessing import StandardScaler


matplotlib.use('Agg')

def convert_to_int(value):
    if isinstance(value, str):  
        if 'M' in value:
            return int(float(value.replace('M', '')) * 1e6)
        elif 'K' in value:
            return int(float(value.replace('K', '')) * 1e3)
        else:
            return int(value)
    else:
        return value  

    
def create_scatter_plot(csv_path):
   
    # Read the Excel file, specifying header=1 because the title is in the first row
    df = pd.read_excel(csv_path, header=1)
    
    df.replace("N/A'", pd.NA, inplace=True)
    # Drop rows where any column has NaN
    df = df.dropna()
    
    y_channel = df['Youtube channel'].values

    features = df[['Followers', 'Avg. views', 'Avg. likes', 'Avg. comments']].values
    features = pd.DataFrame(features)
    features = features.applymap(convert_to_int)
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    # Create a dissimilarity matrix
    dissM = np.zeros((len(features_scaled), len(features_scaled)))

    for i in range(len(features_scaled)):
        for j in range(len(features_scaled)):
            dissM[i, j] = np.linalg.norm(features_scaled[i] - features_scaled[j])
            #print("Diss of ",i,j,"\n",dissM[i,j],"\n")

    # Multidimensional Scaling (MDS)
    mds = MDS(n_components=2, max_iter=300, dissimilarity="precomputed", random_state=42)
    pos = mds.fit_transform(dissM)
    pos1 = mds.fit(dissM).embedding_
    stress=mds.fit(dissM).stress_

    print(pos)
    s = 30
    plt.scatter(pos1[:, 0], pos1[:, 1], color='red', s=s, lw=0, label='d[i]-d[j]')


    annotations = []
    for label, x, y in zip(y_channel, pos1[:, 0], pos1[:, 1]):
        annotations.append({
            'label': label,
            'x': x,
            'y': y
        })
    
    for annotation in annotations:
        for key, value in annotation.items():
            if isinstance(value, np.float64):
                annotation[key] = float(value)
                print(annotation)
    return annotations

