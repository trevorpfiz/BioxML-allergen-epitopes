from pydantic import BaseModel


class InputObjectBase(BaseModel):
    pass
    # *****************************************
    # Add Attributes Here
    # *****************************************


class InputObject(InputObjectBase):
    class Config:
        orm_mode = True
