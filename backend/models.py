from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Table, LargeBinary, Float, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from flask_login import UserMixin
from . import db
from uuid import uuid4
import enum

def get_uuid():
    return uuid4().hex

class User(UserMixin, db.Model):

    __tablename__ = 'users'

    def get_id(self):
        return (self.user_id)
    
    user_id = Column(String(32), primary_key=True, unique=True, default=get_uuid)
    email = Column(String(150), unique=True)
    password = Column(Text, nullable=False)
    has_token = Column(Boolean, nullable=False)
    token = Column(String(100), unique=True, nullable=True)
    is_active = Column(Boolean, nullable=False)


    # 1 to many relationships #
    wantlist = relationship("Wantlist", uselist=False, backref="users") 
    # 1 to many relationships #
    
    def __repr__(self):
        return f"<User: {self.email}>"

class Item(db.Model):

    __tablename__ = 'items'

    id = Column(String(32), primary_key=True, unique=True, default=get_uuid)

    item_id = Column(Integer, nullable=False, autoincrement=False)

    def get_id(self):
        return (self.item_id)

    name = Column(String(256), nullable=False)
    price = Column(Float, nullable=False)
    count = Column(Integer, nullable=False) 
    image = Column(String(256), nullable=False) 
    status = Column(String(16), nullable=False)  
    time_created = Column(DateTime(timezone=True), server_default=func.now())

    wantlist_id = Column(Integer, ForeignKey("wantlist.wantlist_id"), nullable=False)
   # order_id = Column(String(32), ForeignKey("orders.order_id"), nullable=True)


    def __repr__(self):
        return f"<Item: {self.name}>"
    
class Wantlist(db.Model):
    __tablename__ = 'wantlist'
    wantlist_id = Column(Integer, primary_key=True, unique=True)
    user_id = Column(String(32), ForeignKey('users.user_id'))

    # 1 to many relationships #
    item_id = relationship('Item', cascade='all, delete', backref='wantlist', lazy=True)  
    # 1 to many relationships #


    def __repr__(self):
        return f"<Wantlist: {self.name}>"
    

#Order Table

#class Status(enum.Enum):
#    dispatched = "dispatched"
#    canceled = "canceled"
#    accepted = "accepted"

#class Order(db.Model):

#    __tablename__ = 'orders'

#    order_id = Column(String(32), primary_key=True, unique=True, default=get_uuid)

#    def get_id(self):
#        return (self.order_id)

#    email = Column(String(256), nullable=False)
#    shipping_adress = Column(String(256), nullable=False)
#   is_user = Column(Boolean, nullable=False)
#    user_id = Column(String(32), ForeignKey('users.user_id'), nullable=True)
#    status = Column(Enum(Status))  
#    time_created = Column(DateTime(timezone=True), server_default=func.now())


#   def __repr__(self):
#        return f"<Order: {self.name}>"