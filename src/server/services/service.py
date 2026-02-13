class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def sample_service(variable:str):

    condition = ...

    if condition:
        raise AppError("error message",400)
    
    return ...

