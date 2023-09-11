from flask import Blueprint, Flask, render_template, request, url_for, flash, redirect, jsonify, json
from flask_mail import Mail, Message
from flask_login import login_required, current_user
from . import db
from .models import *
from flask_bcrypt import Bcrypt 
from flask_cors import CORS, cross_origin

#initialize flask app
main = Blueprint('main', __name__)

mail_app = Flask(__name__)
#Email app config
mail_app.config['MAIL_SERVER']='smtp.gmail.com'
mail_app.config['MAIL_PORT'] = 587
mail_app.config['MAIL_USERNAME'] = ''
mail_app.config['MAIL_PASSWORD'] = ''
mail_app.config['MAIL_USE_TLS'] = True
mail_app.config['MAIL_USE_SSL'] = False
mail = Mail(mail_app)


cors_app = Flask(__name__)

bcrypt = Bcrypt(cors_app) 
CORS(cors_app, supports_credentials=True)

def query_to_dict(f, name):
    dictionary = {}
    dictionary[name] = []
    my_string = ''
    for key in f:
        for k in key:
            dictionary[name].append(my_string.join(str(k)))

    #dictionary[name].append(names)
    return dictionary

@login_required
@main.route('/')
def index():
    return render_template('index.html')

@login_required
@main.route('/access')
def access():
    unactive_users = db.session.query(User.email, User.user_id).filter(User.is_active=='0').all()
    return render_template('access.html', unactive_users=unactive_users)
    
@login_required
@main.route('/access/grant_access', methods=['POST'])
def grant_access():
    f = request.form
    print(f)
    ids = []
    emails = []
    #print(f)
    
    for key in f.keys():
        for value in f.getlist(key):
            print(key,":",value)  
            ids.append(key)
            db.session.query(User).filter(User.email == key).update({'is_active': True})
            emails.append(db.session.query(User.email).filter(User.email == key).first())
            db.session.commit()

    #print(ids)
    #print(emails)
    for key in emails:
        for k in key:
            print(key)  
            #send email to user
            msg = Message('Your account has been activated!', sender =   'georgsinventory@gmail.com', recipients = [k])
            msg.body = "You can now login to your own inventory! Please connect to G-Spot and go to:" + "  http://192.168.2.216:5173"
            mail.send(msg)
            flash('Changes have been saved!')
    
    return redirect(url_for('main.access'))

### Still in development
@main.route('/get_wantlist', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_wantlist():

    user = request.json['email']

    print(user)

    #Search for user id via provided email in Post request
    uid = db.session.query(User).filter(User.email == user).first()

    print(uid)
    

    if uid is not None:
        #Check if there is a wantlist for that user
        if Wantlist.query.filter_by(user_id=uid.user_id).first() is not None:
            #if there is an wantlist then...

            #Get all items with the id for that user
            items_ids = db.session.query(Item).join(Wantlist).filter(Wantlist.user_id == uid.user_id).first()
            #Get all items from the DB corresponding that user
            all_items_for_user = db.session.query(Item.item_id, Item.name, Item.count, Item.price, Item.image, Item.status).filter(Item.wantlist_id == items_ids.wantlist_id)

            #Transform to key pair values

            #Define keys
            keys = ['id', 'name', 'price', 'count', 'image', 'status']

            as_dict = [dict(zip(keys, record)) for record in all_items_for_user.all()]

            
            print(json.dumps(as_dict, default=str))
            user_dict = {}
            user_dict[user] = as_dict

            print(json.dumps(user_dict, default=str))

            return user_dict

        else:

            return jsonify({
                "'"+uid.email+"'": "[]"
            })
    else:
        return "Wantlist not fetched", 409


### Still in development
@main.route('/wantlist', methods=['POST'])
@cross_origin(supports_credentials=True)
def wantlist():

    #save post request
    wantlist = request.json["wantlist"]


    #Take values from Post request and save them
    user = ''
    items = []

    for k, v in wantlist.items():
        print(k)
        user = k
        for i in v:
            print(i)
            items.append(i)

    #Search for user id via provided email in Post request
    uid = db.session.query(User).filter(User.email == user).first()

    #Create Wantlist in DB if there is none
    if Wantlist.query.filter_by(user_id=uid.user_id).first() is None:
        newWantlist = Wantlist(user_id = uid.user_id)
        db.session.add(newWantlist)
        db.session.commit()

    #Delete all items in wantlist for the user in the DB
    #Get all items with the id for that user
    items_ids = db.session.query(Item).join(Wantlist).filter(Wantlist.user_id == uid.user_id).first()
    
    #Delete items
    if items_ids is not None:
        db.session.query(Item).filter(Item.wantlist_id == items_ids.wantlist_id).delete()
        db.session.commit()

 

    #Get wantlist id for that user
    wid = db.session.query(Wantlist).filter(Wantlist.user_id == uid.user_id).first()
    #Add Items from POST request in the DB
    for i in items:
        newItem = Item(item_id = i['id'], name = i['name'], price = i['price'], count = i["count"], image = i["image"], status = i["status"], wantlist_id = wid.wantlist_id)
        db.session.add(newItem)
        db.session.commit()
            
    #Get all items with the id for that user again to update from DB
    items_ids = db.session.query(Item).join(Wantlist).filter(Wantlist.user_id == uid.user_id).first()

    #Get all items from the DB corresponding that user
    all_items_for_user = db.session.query(Item.item_id, Item.name, Item.count, Item.price, Item.image, Item.status).filter(Item.wantlist_id == items_ids.wantlist_id)
    
    #return added items with user as response as Wantlist type

    #List of tuples
    print(all_items_for_user.all())

    #Transform to key pair values

    #Define keys
    keys = ['id', 'name', 'price', 'count', 'image', 'status']

    as_dict = [dict(zip(keys, record)) for record in all_items_for_user.all()]

    user_dict = {}
    user_dict[user] = as_dict

    print(user_dict)

    #return response
    if user_dict is None:
        return 'undefined', 409
    return user_dict