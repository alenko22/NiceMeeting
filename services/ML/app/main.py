from fastapi import FastAPI

app = FastAPI()

@app.get("/ping")
def ping():
    return {"pong": True}

from pydantic import BaseModel

class PredictRequest(BaseModel):
    user_id: int

@app.post("/predict")
def predict(req: PredictRequest):
    # заглушка: вернём фиксированный список
    return {"matches": [101, 202, 303], "user_id": req.user_id}
