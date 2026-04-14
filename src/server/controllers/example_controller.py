from schemas.schema import SampleRequest
from services.example_service import sample_service,AppError
from fastapi import HTTPException


def sample_controller(request:SampleRequest)->type:

    try:

        result = sample_service(request.request_param1)

    except AppError as error:
        
        raise HTTPException(
            detail=error.message,
            status_code=error.status_code
        )


