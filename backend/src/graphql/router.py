from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.responses import PlainTextResponse

from src.graphql.schema import schema
from src.auth.jwt_utils import verify_token
from src.core.db import get_db_session


router = APIRouter(prefix="/graphql", tags=["graphql"])


def get_patient_id_from_auth(request: Request) -> str:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.split(" ", 1)[1]
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return str(data.get("sub"))


@router.post("")
async def graphql_post(request: Request, patient_id: str = Depends(get_patient_id_from_auth), db_session = Depends(get_db_session)):
    body = await request.json()
    query = body.get("query")
    variables = body.get("variables")
    if not query:
        raise HTTPException(status_code=400, detail="Missing GraphQL query")
    
    # Inject database session into GraphQL context
    context_value = {
        "patient_id": patient_id,
        "db_session": db_session
    }
    
    result = schema.execute(query, variable_values=variables, context_value=context_value)
    resp = {}
    if result.errors:
        resp["errors"] = [str(e) for e in result.errors]
    if result.data is not None:
        resp["data"] = result.data
    return JSONResponse(resp)


@router.get("")
async def graphql_get():
    return PlainTextResponse("Send POST requests with GraphQL query to this endpoint.")


