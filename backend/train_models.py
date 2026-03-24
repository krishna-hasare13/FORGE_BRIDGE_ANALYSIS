import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import os

# Create models directory if it doesn't exist
os.makedirs("models", exist_ok=True)

print("Starting XGBoost training...")
np.random.seed(42)
n = 2000

df = pd.DataFrame({
    'crack_area':       np.random.uniform(0, 60, n),
    'crack_count':      np.random.randint(0, 20, n),
    'structure_age':    np.random.uniform(1, 100, n),
    'load_factor':      np.random.uniform(0.1, 1.0, n),
    'zone_criticality': np.random.uniform(0, 1, n),
})

df['risk_score'] = (
    df['crack_area'] * 0.5 +
    df['structure_age'] * 0.3 +
    df['load_factor'] * 20
).clip(0, 100)

df['risk_level'] = pd.cut(df['risk_score'],
    bins=[0,25,50,75,100],
    labels=['LOW','MEDIUM','HIGH','CRITICAL'])

le = LabelEncoder()
df['label'] = le.fit_transform(df['risk_level'])

X = df[['crack_area','crack_count','structure_age','load_factor','zone_criticality']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
xgb = XGBClassifier(n_estimators=100)
xgb.fit(X_train, y_train)

print(f"Accuracy: {xgb.score(X_test, y_test)*100:.1f}%")

pickle.dump(xgb, open('models/xgboost_risk.pkl','wb'))
pickle.dump(le,  open('models/label_encoder.pkl','wb'))
print("XGBoost Done!")

print("Starting LSTM training...")
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def gen_data(n=3000):
    X, y = [], []
    for _ in range(n):
        start = np.random.uniform(10, 60)
        rate  = np.random.uniform(1.5, 8)
        seq   = [min(start + rate*i + np.random.normal(0,1), 100) for i in range(6)]
        X.append(seq[:5])
        y.append(seq[5])
    return np.array(X).reshape(-1,5,1), np.array(y)

X_lstm, y_lstm = gen_data()
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(5,1)),
    Dropout(0.2),
    LSTM(32),
    Dense(1)
])
model.compile(optimizer='adam', loss='mse')
model.fit(X_lstm, y_lstm, epochs=20, batch_size=32, verbose=0)
model.save('models/lstm_life.keras')
print("LSTM Done!")
