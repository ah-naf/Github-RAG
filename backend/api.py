from fastapi import FastAPI
from pydantic import BaseModel
from main import run_query
from fastapi.concurrency import run_in_threadpool

app = FastAPI()

class QueryRequest(BaseModel):
    username: str
    repo_name: str
    branch: str = "origin"
    token: str | None = None
    question: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/ask")
async def ask(req: QueryRequest):
    # Run the (sync) query in a thread pool so we don’t block FastAPI’s event loop
    answer = await run_in_threadpool(
        run_query,
        req.username,
        req.repo_name,
        req.question,
        req.branch,
        req.token
    )
    print(answer)
    return {"text": answer, "sender": "bot"}