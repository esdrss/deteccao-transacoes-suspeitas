from __future__ import annotations

import io
import math
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Tuple

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field

import storage


APP_DIR = Path(__file__).resolve().parent
INDEX_HTML = APP_DIR / "index.html"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


app = FastAPI(title="Detecção de Transações Suspeitas (CRUD + Análise)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


class DatasetOut(BaseModel):
    id: str
    name: str
    original_filename: str
    size_bytes: int
    uploaded_at: str
    updated_at: str
    last_analysis_at: Optional[str] = None
    last_analysis_method: Optional[str] = None
    last_suspeitas_count: Optional[int] = None
    last_thresholds: Optional[Dict[str, Any]] = None


class AnalyzeRequest(BaseModel):
    method: Literal["sigma", "zscore", "iqr", "mad"] = "sigma"
    # "k" é o multiplicador/limiar principal do método.
    k: float = Field(default=3.0, ge=0.0)
    direction: Literal["upper", "lower", "both"] = "upper"
    column: str = "valor"
    streaming: bool = False
    max_suspeitas: int = Field(default=500, ge=1, le=5000)


def _read_dataframe_from_bytes(filename: str, content: bytes) -> pd.DataFrame:
    name = (filename or "").lower()
    if name.endswith(".csv"):
        return pd.read_csv(io.BytesIO(content))
    if name.endswith(".xlsx"):
        return pd.read_excel(io.BytesIO(content), engine="openpyxl")
    if name.endswith(".xls"):
        return pd.read_excel(io.BytesIO(content), engine="xlrd")
    # fallback
    return pd.read_excel(io.BytesIO(content))


def _read_dataframe_from_path(path: Path) -> pd.DataFrame:
    name = path.name.lower()
    if name.endswith(".csv"):
        return pd.read_csv(path)
    if name.endswith(".xlsx"):
        return pd.read_excel(path, engine="openpyxl")
    if name.endswith(".xls"):
        return pd.read_excel(path, engine="xlrd")
    return pd.read_excel(path)


def _coerce_numeric_series(df: pd.DataFrame, column: str) -> pd.Series:
    if column not in df.columns:
        raise ValueError(f"A planilha precisa ter uma coluna chamada '{column}'.")
    s = pd.to_numeric(df[column], errors="coerce")
    s = s.dropna()
    return s


def _mean_std_streaming_csv(path: Path, column: str, chunksize: int = 200_000) -> Tuple[int, float, float]:
    """Calcula média e desvio padrão amostral (ddof=1) via Welford (streaming).

    OBS: só funciona para métodos baseados em média/desvio (sigma/zscore).
    """
    n = 0
    mean = 0.0
    m2 = 0.0

    for chunk in pd.read_csv(path, chunksize=chunksize):
        if column not in chunk.columns:
            raise ValueError(f"A planilha precisa ter uma coluna chamada '{column}'.")
        vals = pd.to_numeric(chunk[column], errors="coerce").dropna().tolist()
        for x in vals:
            n += 1
            delta = x - mean
            mean += delta / n
            delta2 = x - mean
            m2 += delta * delta2

    if n < 2:
        raise ValueError("Poucos dados na coluna para calcular desvio padrão.")

    var = m2 / (n - 1)
    std = math.sqrt(var) if var > 0 else 0.0
    return n, mean, std


def _threshold_mask(values: pd.Series, lower: Optional[float], upper: Optional[float]) -> pd.Series:
    if lower is not None and upper is not None:
        return (values < lower) | (values > upper)
    if upper is not None:
        return values > upper
    if lower is not None:
        return values < lower
    # Sem thresholds, nada é suspeito
    return values.astype(bool) & False


def _analyze_df(df: pd.DataFrame, req: AnalyzeRequest) -> Dict[str, Any]:
    t0 = time.perf_counter()

    col = req.column
    series = _coerce_numeric_series(df, col)
    if len(series) < 2:
        raise ValueError("Poucos dados na coluna 'valor' para calcular estatísticas.")

    method = req.method
    direction = req.direction
    k = float(req.k)

    stats: Dict[str, Any] = {}
    thresholds: Dict[str, Optional[float]] = {"lower": None, "upper": None}

    if method in {"sigma", "zscore"}:
        mean = float(series.mean())
        std = float(series.std(ddof=1))
        stats.update({"mean": mean, "std": std})

        if std == 0.0:
            # Tudo igual -> nada suspeito (a menos que você queira comparar com 0)
            lower = upper = None
        else:
            if method == "sigma":
                lower = mean - k * std
                upper = mean + k * std
            else:
                # z-score: |z| > k
                lower = mean - k * std
                upper = mean + k * std

        if direction == "upper":
            thresholds["upper"] = upper
        elif direction == "lower":
            thresholds["lower"] = lower
        else:
            thresholds["lower"] = lower
            thresholds["upper"] = upper

        mask = _threshold_mask(series, thresholds["lower"], thresholds["upper"])

    elif method == "iqr":
        q1 = float(series.quantile(0.25))
        q3 = float(series.quantile(0.75))
        iqr = q3 - q1
        stats.update({"q1": q1, "q3": q3, "iqr": iqr})

        if iqr == 0.0:
            lower = upper = None
        else:
            lower = q1 - k * iqr
            upper = q3 + k * iqr

        if direction == "upper":
            thresholds["upper"] = upper
        elif direction == "lower":
            thresholds["lower"] = lower
        else:
            thresholds["lower"] = lower
            thresholds["upper"] = upper

        mask = _threshold_mask(series, thresholds["lower"], thresholds["upper"])

    elif method == "mad":
        median = float(series.median())
        mad = float((series - median).abs().median())
        stats.update({"median": median, "mad": mad})

        if mad == 0.0:
            lower = upper = None
        else:
            # Modified Z-score: 0.6745 * (x - median) / MAD
            # Convertendo pra limites em valor: median ± (k * MAD) / 0.6745
            scale = (k * mad) / 0.6745
            lower = median - scale
            upper = median + scale

        if direction == "upper":
            thresholds["upper"] = upper
        elif direction == "lower":
            thresholds["lower"] = lower
        else:
            thresholds["lower"] = lower
            thresholds["upper"] = upper

        mask = _threshold_mask(series, thresholds["lower"], thresholds["upper"])

    else:
        raise ValueError("Método inválido")

    # Aplicar máscara no DF original (apenas nas linhas onde 'col' é numérico)
    # Para isso, recriamos a coluna numérica no DF e filtramos
    df2 = df.copy()
    df2[col] = pd.to_numeric(df2[col], errors="coerce")
    df2 = df2.dropna(subset=[col])
    # `mask` tem o mesmo índice de `df2` (após dropna), então podemos alinhar por índice.
    suspeitas_df = df2.loc[mask]

    # Limitar a quantidade de suspeitas retornadas (evita respostas gigantes)
    total_suspeitas = int(len(suspeitas_df))
    truncated = False
    if total_suspeitas > req.max_suspeitas:
        suspeitas_df = suspeitas_df.head(req.max_suspeitas)
        truncated = True

    # Pequenos arredondamentos para deixar apresentável
    def r2(x: Optional[float]) -> Optional[float]:
        return None if x is None else round(float(x), 2)

    for kstats in list(stats.keys()):
        stats[kstats] = r2(stats[kstats])
    thresholds = {"lower": r2(thresholds["lower"]), "upper": r2(thresholds["upper"])}

    dt_ms = int((time.perf_counter() - t0) * 1000)
    return {
        "method": method,
        "direction": direction,
        "column": col,
        "stats": stats,
        "thresholds": thresholds,
        "quantidade_suspeitas": total_suspeitas,
        "suspeitas": suspeitas_df.to_dict(orient="records"),
        "truncated": truncated,
        "analysis_ms": dt_ms,
        "analysis_at": utc_now_iso(),
        "n_valid": int(len(series)),
    }


def _analyze_path(path: Path, req: AnalyzeRequest) -> Dict[str, Any]:
    """Analisa arquivo em disco.

    streaming só é aplicado para CSV em métodos baseados em mean/std.
    """
    if req.streaming and path.suffix.lower() == ".csv" and req.method in {"sigma", "zscore"}:
        # 1) calcula mean/std em streaming
        n, mean, std = _mean_std_streaming_csv(path, req.column)

        if std == 0.0:
            thresholds = {"lower": None, "upper": None}
        else:
            lower = mean - req.k * std
            upper = mean + req.k * std
            thresholds = {"lower": lower, "upper": upper}

        # ajusta direction
        if req.direction == "upper":
            thresholds["lower"] = None
        elif req.direction == "lower":
            thresholds["upper"] = None

        # 2) segundo passe pra coletar suspeitas
        suspeitas: List[Dict[str, Any]] = []
        total_sus = 0
        chunksize = 200_000
        for chunk in pd.read_csv(path, chunksize=chunksize):
            if req.column not in chunk.columns:
                raise ValueError(f"A planilha precisa ter uma coluna chamada '{req.column}'.")
            chunk[req.column] = pd.to_numeric(chunk[req.column], errors="coerce")
            chunk = chunk.dropna(subset=[req.column])
            mask = _threshold_mask(chunk[req.column], thresholds.get("lower"), thresholds.get("upper"))
            sus_chunk = chunk.loc[mask]
            if len(sus_chunk) == 0:
                continue
            total_sus += int(len(sus_chunk))
            if len(suspeitas) < req.max_suspeitas:
                take = req.max_suspeitas - len(suspeitas)
                suspeitas.extend(sus_chunk.head(take).to_dict(orient="records"))

        truncated = total_sus > req.max_suspeitas

        def r2(x: Optional[float]) -> Optional[float]:
            return None if x is None else round(float(x), 2)

        out = {
            "method": req.method,
            "direction": req.direction,
            "column": req.column,
            "stats": {"mean": r2(mean), "std": r2(std)},
            "thresholds": {"lower": r2(thresholds.get("lower")), "upper": r2(thresholds.get("upper"))},
            "quantidade_suspeitas": int(total_sus),
            "suspeitas": suspeitas,
            "truncated": truncated,
            "analysis_ms": None,
            "analysis_at": utc_now_iso(),
            "n_valid": int(n),
            "streaming": True,
        }
        return out

    # Sem streaming
    df = _read_dataframe_from_path(path)
    return _analyze_df(df, req)


@app.on_event("startup")
def _startup() -> None:
    storage.ensure_storage()


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/", response_class=HTMLResponse)
def home() -> Any:
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    return "index.html não encontrado"


# -------------------------
# CRUD de datasets
# -------------------------


@app.post("/datasets", response_model=DatasetOut)
async def create_dataset(
    arquivo: UploadFile = File(...),
    name: Optional[str] = Form(default=None),
) -> DatasetOut:
    content = await arquivo.read()
    try:
        meta = storage.create_dataset(file_bytes=content, filename=arquivo.filename or "dataset", name=name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return DatasetOut(
        id=meta.id,
        name=meta.name,
        original_filename=meta.original_filename,
        size_bytes=meta.size_bytes,
        uploaded_at=meta.uploaded_at,
        updated_at=meta.updated_at,
        last_analysis_at=meta.last_analysis_at,
        last_analysis_method=meta.last_analysis_method,
        last_suspeitas_count=meta.last_suspeitas_count,
        last_thresholds=meta.last_thresholds,
    )


@app.get("/datasets", response_model=List[DatasetOut])
def list_datasets() -> List[DatasetOut]:
    datasets = storage.list_datasets().values()
    # mais recente primeiro
    ordered = sorted(datasets, key=lambda m: m.uploaded_at, reverse=True)
    return [
        DatasetOut(
            id=m.id,
            name=m.name,
            original_filename=m.original_filename,
            size_bytes=m.size_bytes,
            uploaded_at=m.uploaded_at,
            updated_at=m.updated_at,
            last_analysis_at=m.last_analysis_at,
            last_analysis_method=m.last_analysis_method,
            last_suspeitas_count=m.last_suspeitas_count,
            last_thresholds=m.last_thresholds,
        )
        for m in ordered
    ]


@app.get("/datasets/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: str) -> DatasetOut:
    meta = storage.get_dataset(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset não encontrado")
    return DatasetOut(
        id=meta.id,
        name=meta.name,
        original_filename=meta.original_filename,
        size_bytes=meta.size_bytes,
        uploaded_at=meta.uploaded_at,
        updated_at=meta.updated_at,
        last_analysis_at=meta.last_analysis_at,
        last_analysis_method=meta.last_analysis_method,
        last_suspeitas_count=meta.last_suspeitas_count,
        last_thresholds=meta.last_thresholds,
    )


@app.put("/datasets/{dataset_id}", response_model=DatasetOut)
async def update_dataset(
    dataset_id: str,
    name: Optional[str] = Form(default=None),
    arquivo: Optional[UploadFile] = File(default=None),
) -> DatasetOut:
    new_bytes = None
    new_filename = None
    if arquivo is not None:
        new_bytes = await arquivo.read()
        new_filename = arquivo.filename or "dataset"
    try:
        meta = storage.update_dataset(dataset_id, new_name=name, new_file_bytes=new_bytes, new_filename=new_filename)
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset não encontrado")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return DatasetOut(
        id=meta.id,
        name=meta.name,
        original_filename=meta.original_filename,
        size_bytes=meta.size_bytes,
        uploaded_at=meta.uploaded_at,
        updated_at=meta.updated_at,
        last_analysis_at=meta.last_analysis_at,
        last_analysis_method=meta.last_analysis_method,
        last_suspeitas_count=meta.last_suspeitas_count,
        last_thresholds=meta.last_thresholds,
    )


@app.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: str) -> Dict[str, str]:
    try:
        storage.delete_dataset(dataset_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset não encontrado")
    return {"status": "deleted"}


# -------------------------
# Análise por dataset
# -------------------------


@app.post("/datasets/{dataset_id}/analyze")
def analyze_dataset(dataset_id: str, req: AnalyzeRequest) -> Dict[str, Any]:
    meta = storage.get_dataset(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset não encontrado")

    path = storage.dataset_path(meta)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Arquivo do dataset não encontrado")

    try:
        result = _analyze_path(path, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao analisar: {type(e).__name__}: {e}")

    storage.save_result(dataset_id, result)
    return result


@app.get("/datasets/{dataset_id}/result")
def get_last_result(dataset_id: str) -> Dict[str, Any]:
    meta = storage.get_dataset(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset não encontrado")
    result = storage.load_result(dataset_id)
    if not result:
        raise HTTPException(status_code=404, detail="Nenhuma análise encontrada para este dataset")
    return result


# -------------------------
# Endpoint legado (sem CRUD)
# -------------------------


@app.post("/analisar")
async def analisar_planilha_legado(
    arquivo: UploadFile = File(...),
    method: Literal["sigma", "zscore", "iqr", "mad"] = "sigma",
    k: float = 3.0,
    direction: Literal["upper", "lower", "both"] = "upper",
    column: str = "valor",
) -> Dict[str, Any]:
    content = await arquivo.read()
    try:
        df = _read_dataframe_from_bytes(arquivo.filename or "dataset", content)
        req = AnalyzeRequest(method=method, k=k, direction=direction, column=column, streaming=False)
        return _analyze_df(df, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao analisar: {type(e).__name__}: {e}")
