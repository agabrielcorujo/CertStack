from jwt_auth.db.db import safe_query,DBError
import json

class ProfileError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def create_profile(user_id:str,certs:list=[]):

    if certs:
        formatted_certs = [{"cert":cert,
                            "correctqnum":0,
                            "incorrectqnum":0
                            } for cert in certs]

    try:
        formatted_certs = [
            {
                "cert": cert,
                "correctqnum": 0,
                "incorrectqnum": 0
            } for cert in certs
        ]

        res = await safe_query(
            "UPDATE users SET certs = $1::jsonb[] WHERE id = $2 RETURNING id",
            ([json.dumps(cert) for cert in formatted_certs], user_id),
            fetch="one"
        )

    except DBError as error:

        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error creating profile")
    
    return {"status":"success"}
    
async def update_profile(user_id:str,cert:str):

    formatted_cert = {"cert":cert,
                    "correctqnum":0,
                    "incorrectqnum":0
                    }

    try:
        query = """
        UPDATE users 
        SET certs = array_append(certs, $1::jsonb) 
        WHERE id = $2 
        RETURNING id
        """

        res = await safe_query(
            query,
            (json.dumps(formatted_cert), user_id),  # ← THIS is the key
            fetch="one"
        )

    except DBError as error:
        
        raise ProfileError(status_code=error.status_code,message=error.message)
    
    if not res: 
    
        raise ProfileError(status_code=400,message="error updating profile")
    
    return {"status":"success"}

async def get_profile(user_id:str):
    query = "SELECT first_name,certs FROM users WHERE id = $1"

    try:
        result = await safe_query(query,(user_id,),fetch="one")
    except DBError as e:
        raise ProfileError("error fetching profile",500)
    
    return {
        "name":result[0],
        "certs":result[1]
    }





