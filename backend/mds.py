import pandas as pd
from sklearn.manifold import MDS
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import StandardScaler
from joblib import Parallel, delayed

# Abbiamo usato mds con dissimilarity matrix calcolata su euclidian distance perchè:
# MDS directly works with a dissimilarity matrix and attempts to preserve those dissimilarities in the lower-dimensional space (mitiga false positives). E poi per usare checkbox
# Per prima cosa si portano tutti i valori da stringhe a interi, dopo ci sarà normalizzazione
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

# questa funzione prende in input le features e crea un array diff_matrix 3d i,j,k che rappresenta la differenza dell'elemento i e j sulla feature k
# poi fa quadrato e somma lungo l'asse delle features (dando fuori sum_squared_diff che è array 2d che indica valore per ogni coppia di valori) ed infine radice.
# è quindi solo una fancy way di fare euclidian, fancy perchè così si può fare faster calculations con numpy arrays
def calculate_dissimilarity_matrix(features_scaled,likes,comments,views,followers):


    diff_matrix = features_scaled[:, np.newaxis, :] - features_scaled
    squared_diff = diff_matrix ** 2
    sum_squared_diff = np.sum(squared_diff, axis=-1)
    dissimilarity_matrix = np.sqrt(sum_squared_diff)
    print("First 5 rows of diff matrix:\n", diff_matrix[:5, :])
    return dissimilarity_matrix

def create_scatter_plot(csv_path,likes,comments,views,followers):
    print("Likes:", likes)
    print("Comments:", comments)
    print("Views:", views)
    print("Followers:", followers)
    selected_columns = []

    if likes.lower() == 'true':
        selected_columns.append('Avg. likes')
    if comments.lower() == 'true':
        selected_columns.append('Avg. comments')
    if views.lower() == 'true':
        selected_columns.append('Avg. views')
    if followers.lower() == 'true':
        selected_columns.append('Followers')

    df = pd.read_excel(csv_path, header=0)
    df.replace(["N/A", "N/A'", ""], pd.NA, inplace=True)
    df = df.dropna()
    print("selected_columns:", selected_columns)
    y_channel = df['Youtube channel'].values
    features = df[selected_columns].applymap(convert_to_int).values

    # NORMALIZATION: This ensures that each feature has zero mean and unit variance, making them comparable and preventing features with larger scales from dominating the analysis.
    features_scaled = StandardScaler().fit_transform(features)

    # Calculate dissimilarity matrix in parallel
    dissM = Parallel(n_jobs=-1)(delayed(calculate_dissimilarity_matrix)(features_scaled,likes,comments,views,followers) for _ in range(10))

    dissM = np.mean(dissM, axis=0)  # Use the mean dissimilarity matrix from parallel runs

    # Multidimensional Scaling (MDS)
    mds = MDS(n_components=2, max_iter=50, dissimilarity="precomputed", random_state=42, normalized_stress='auto')

    # Timing the MDS computation
    pos1 = mds.fit_transform(dissM)

    s = 30
    plt.scatter(pos1[:, 0], pos1[:, 1], color='red', s=s, lw=0, label='d[i]-d[j]')

    annotations = [{'label': label, 'x': float(x), 'y': float(y)} for label, x, y in zip(y_channel, pos1[:, 0], pos1[:, 1])]

    return annotations

