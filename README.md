# CoviDash

## instructions
**install**
```
pip install -r requirements.txt
cd js
npm update
cd ..
```

**train models and make predictions**
```
python predictions.py --download_new_file true --locations true --train_new_model true
```

**just make predictions**
```
python predictions.py --locations true
```

**run tests**
```
python -m unittest
```

**run local app**
```
python app.py
```
