from api import app  # permite rodar: uvicorn main:app

if __name__ == "__main__":
    import uvicorn
    # Roda a API e serve o index.html em http://127.0.0.1:8000/
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
