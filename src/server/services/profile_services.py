from jwt_auth.db.db import safe_query,DBError

class ProfileError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

def create_profile(user_id:str,certs:list=[]):

    try:
        res = safe_query("UPDATE users SET certs = %s WHERE id = %s RETURNING id",(certs,user_id),insert=True,fetch="one")

    except DBError as error:

        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error creating profile")
    
    return {"status":"success"}
    
def update_profile(user_id:str,cert:str):

    try:
        res = safe_query("UPDATE users SET certs = array_append(certs,%s) WHERE id = %s RETURNING id",(cert,user_id),insert=True,fetch="one")

    except DBError as error:
        
        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error updating profile")
    
    return {"status":"success"}




