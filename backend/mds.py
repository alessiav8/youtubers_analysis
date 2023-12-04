import pandas as pd
from sklearn.manifold import MDS
import matplotlib.pyplot as plt
import numpy as np
import os
import matplotlib
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

    
def create_scatter_plot():
    script_directory = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_directory, 'june2022.xlsx')
    # Read the Excel file, specifying header=1 because the title is in the first row
    df = pd.read_excel(csv_path, header=1)
    
    df.replace("N/A'", pd.NA, inplace=True)
    # Drop rows where any column has NaN
    df = df.dropna()
    
    y_channel = df['Youtube channel'].values

    features = df[['Followers', 'Avg. views', 'Avg. likes', 'Avg. comments']].values
    features = pd.DataFrame(features)
    features = features.applymap(convert_to_int)
    print("Data Frame\n",features)

    # Create a dissimilarity matrix
    dissM = np.zeros((len(features), len(features)))

    #for now just the euclidean distance between two points, considering their features 
    for i in range(len(features)):
        for j in range(len(features)):
            print("i,\n",features.iloc[i])
            print("\nj,\n",features.iloc[j])

            dissM[i, j] = np.linalg.norm(features.iloc[i] - features.iloc[j])

    # Multidimensional Scaling (MDS)
    mds = MDS(n_components=2, max_iter=300, dissimilarity="precomputed", random_state=42)
    pos = mds.fit_transform(dissM)

    # Scatter plot
    s = 30
    plt.scatter(pos[:, 0], pos[:, 1], color='red', s=s, lw=0, label='d[i]-d[j]')

    annotations = []
    for label, x, y in zip(y_channel, pos[:, 0], pos[:, 1]):
        annotations.append({
            'label': label,
            'x': x,
            'y': y
        })
        

    return render_template('index.html', scatter_plot=scatter_plot, annotations=annotations)

