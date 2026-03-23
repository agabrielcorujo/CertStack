from jwt_auth.db.db import safe_query,DBError

class ProfileError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def create_profile(user_id:str,certs:list=[]):

    try:
        res = await safe_query("UPDATE users SET certs = $1 WHERE id = $2 RETURNING id",(certs,user_id),fetch="one")

    except DBError as error:

        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error creating profile")
    
    return {"status":"success"}
    
async def update_profile(user_id:str,cert:str):

    try:
        res = await safe_query("UPDATE users SET certs = array_append(certs,$1) WHERE id = $2 RETURNING id",(cert,user_id),fetch="one")

    except DBError as error:
        
        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error updating profile")
    
    return {"status":"success"}




