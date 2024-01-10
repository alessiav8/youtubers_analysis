import pandas as pd
from sklearn.manifold import MDS
import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import StandardScaler
from joblib import Parallel, delayed

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

def calculate_dissimilarity_matrix(features_scaled):
    diff_matrix = features_scaled[:, np.newaxis, :] - features_scaled
    squared_diff = diff_matrix ** 2
    sum_squared_diff = np.sum(squared_diff, axis=-1)
    dissimilarity_matrix = np.sqrt(sum_squared_diff)
    return dissimilarity_matrix

def create_scatter_plot(csv_path):
    df = pd.read_excel(csv_path, header=0)
    df.replace(["N/A", "N/A'", ""], pd.NA, inplace=True)
    df = df.dropna()

    y_channel = df['Youtube channel'].values
    features = df[['Followers', 'Avg. views', 'Avg. likes', 'Avg. comments']].applymap(convert_to_int).values
    features_scaled = StandardScaler().fit_transform(features)

    # Calculate dissimilarity matrix in parallel
    dissM = Parallel(n_jobs=-1)(delayed(calculate_dissimilarity_matrix)(features_scaled) for _ in range(10))

    dissM = np.mean(dissM, axis=0)  # Use the mean dissimilarity matrix from parallel runs

    # Multidimensional Scaling (MDS)
    mds = MDS(n_components=2, max_iter=50, dissimilarity="precomputed", random_state=42, normalized_stress='auto')

    # Timing the MDS computation
    pos1 = mds.fit_transform(dissM)

    s = 30
    plt.scatter(pos1[:, 0], pos1[:, 1], color='red', s=s, lw=0, label='d[i]-d[j]')

    annotations = [{'label': label, 'x': float(x), 'y': float(y)} for label, x, y in zip(y_channel, pos1[:, 0], pos1[:, 1])]

    return annotations

