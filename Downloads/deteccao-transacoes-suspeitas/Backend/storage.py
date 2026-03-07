from __future__ import annotations

import json
import threading
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = BASE_DIR / "results"
META_FILE = BASE_DIR / "datasets.json"

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

_lock = threading.Lock()


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class DatasetMeta:
    id: str
    name: str
    original_filename: str
    stored_filename: str
    size_bytes: int
    uploaded_at: str
    updated_at: str
    last_analysis_at: Optional[str] = None
    last_analysis_method: Optional[str] = None
    last_suspeitas_count: Optional[int] = None
    last_thresholds: Optional[Dict[str, Any]] = None
    notes: Dict[str, Any] = field(default_factory=dict)


def ensure_storage() -> None:
    """Cria pastas/arquivos necessários (filesystem storage)."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    if not META_FILE.exists():
        META_FILE.write_text(json.dumps({"datasets": {}}, ensure_ascii=False, indent=2), encoding="utf-8")


def _read_meta_raw() -> Dict[str, Any]:
    ensure_storage()
    raw = json.loads(META_FILE.read_text(encoding="utf-8"))
    if "datasets" not in raw or not isinstance(raw["datasets"], dict):
        raw = {"datasets": {}}
    return raw


def _write_meta_raw(raw: Dict[str, Any]) -> None:
    META_FILE.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")


def list_datasets() -> Dict[str, DatasetMeta]:
    with _lock:
        raw = _read_meta_raw()
        return {ds_id: DatasetMeta(**item) for ds_id, item in raw["datasets"].items()}


def get_dataset(ds_id: str) -> Optional[DatasetMeta]:
    return list_datasets().get(ds_id)


def dataset_path(meta: DatasetMeta) -> Path:
    return DATA_DIR / meta.stored_filename


def result_path(ds_id: str) -> Path:
    return RESULTS_DIR / f"{ds_id}.json"


def _safe_ext(filename: str) -> str:
    return Path(filename).suffix.lower()


def create_dataset(*, file_bytes: bytes, filename: str, name: Optional[str] = None) -> DatasetMeta:
    ensure_storage()
    ext = _safe_ext(filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Extensão não suportada: {ext}. Use: {', '.join(sorted(ALLOWED_EXTENSIONS))}.")

    ds_id = uuid4().hex[:12]
    stored_filename = f"{ds_id}{ext}"
    (DATA_DIR / stored_filename).write_bytes(file_bytes)

    now = _utc_now_iso()
    meta = DatasetMeta(
        id=ds_id,
        name=(name or Path(filename).stem or ds_id),
        original_filename=filename,
        stored_filename=stored_filename,
        size_bytes=len(file_bytes),
        uploaded_at=now,
        updated_at=now,
    )

    with _lock:
        raw = _read_meta_raw()
        raw["datasets"][ds_id] = asdict(meta)
        _write_meta_raw(raw)

    return meta


def update_dataset(
    ds_id: str,
    *,
    new_name: Optional[str] = None,
    new_file_bytes: Optional[bytes] = None,
    new_filename: Optional[str] = None,
) -> DatasetMeta:
    ensure_storage()
    with _lock:
        raw = _read_meta_raw()
        item = raw["datasets"].get(ds_id)
        if not item:
            raise KeyError("Dataset não encontrado")

        meta = DatasetMeta(**item)

        if new_name:
            meta.name = new_name

        if new_file_bytes is not None:
            if not new_filename:
                raise ValueError("new_filename é obrigatório ao substituir o arquivo")

            ext = _safe_ext(new_filename)
            if ext not in ALLOWED_EXTENSIONS:
                raise ValueError(f"Extensão não suportada: {ext}.")

            # remove arquivo antigo
            old_path = dataset_path(meta)
            old_path.unlink(missing_ok=True)

            # salva novo arquivo mantendo o mesmo id
            meta.original_filename = new_filename
            meta.stored_filename = f"{ds_id}{ext}"
            dataset_path(meta).write_bytes(new_file_bytes)
            meta.size_bytes = len(new_file_bytes)

            # invalida resultado anterior
            result_path(ds_id).unlink(missing_ok=True)
            meta.last_analysis_at = None
            meta.last_analysis_method = None
            meta.last_suspeitas_count = None
            meta.last_thresholds = None

        meta.updated_at = _utc_now_iso()
        raw["datasets"][ds_id] = asdict(meta)
        _write_meta_raw(raw)

    return meta


def delete_dataset(ds_id: str) -> None:
    ensure_storage()
    with _lock:
        raw = _read_meta_raw()
        item = raw["datasets"].pop(ds_id, None)
        _write_meta_raw(raw)

    if not item:
        raise KeyError("Dataset não encontrado")
    meta = DatasetMeta(**item)
    dataset_path(meta).unlink(missing_ok=True)
    result_path(ds_id).unlink(missing_ok=True)


def save_result(ds_id: str, result: Dict[str, Any]) -> None:
    ensure_storage()
    result_path(ds_id).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    # Atualiza metadados com resumo do último resultado
    with _lock:
        raw = _read_meta_raw()
        item = raw["datasets"].get(ds_id)
        if not item:
            return
        meta = DatasetMeta(**item)
        meta.last_analysis_at = result.get("analysis_at")
        meta.last_analysis_method = result.get("method")
        meta.last_suspeitas_count = result.get("quantidade_suspeitas")
        meta.last_thresholds = result.get("thresholds")
        meta.updated_at = _utc_now_iso()
        raw["datasets"][ds_id] = asdict(meta)
        _write_meta_raw(raw)


def load_result(ds_id: str) -> Optional[Dict[str, Any]]:
    rp = result_path(ds_id)
    if not rp.exists():
        return None
    return json.loads(rp.read_text(encoding="utf-8"))
