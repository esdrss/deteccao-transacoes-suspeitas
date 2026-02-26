from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import statistics
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analisar")
async def analisar_planilha(arquivo: UploadFile = File(...)):
    conteudo = await arquivo.read()
    nome = (arquivo.filename or "").lower()

    if nome.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(conteudo))
    else:
        df = pd.read_excel(io.BytesIO(conteudo))
    if "valor" not in df.columns:
        return {"erro": "A planilha precisa ter uma coluna chamada 'valor'."}

    df["valor"] = pd.to_numeric(df["valor"], errors="coerce")
    df = df.dropna(subset=["valor"])

    valores = df["valor"].tolist()
    if len(valores) < 2:
        return {"erro": "Poucos dados na coluna 'valor' para calcular desvio padrão."}

    media = statistics.mean(valores)
    desvio = statistics.stdev(valores)
    limite = media + 3 * desvio

    suspeitas_df = df[df["valor"] > limite]

    return {
        "media": round(media, 2),
        "desvio_padrao": round(desvio, 2),
        "limite": round(limite, 2),
        "quantidade_suspeitas": int(len(suspeitas_df)),
        "suspeitas": suspeitas_df.to_dict(orient="records")
    }