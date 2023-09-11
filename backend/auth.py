from flask import Blueprint, render_template, redirect, url_for, request, flash, current_app, Flask, jsonify, session
from flask_login import login_required, logout_user
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User
from flask_login import login_user
import time
from flask_mail import Mail, Message
from flask_bcrypt import Bcrypt 
from flask_cors import CORS, cross_origin
import os


SECRET_KEY = os.getenv("VITE_OAUTH_TOKEN")

auth = Blueprint('auth', __name__)

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



@auth.route('/login', methods=['POST'])
@cross_origin(supports_credentials=True)
def login_post():

    email = request.json["email"]
    password = request.json["password"]

    print(os.getenv('VITE_OAUTH_TOKEN'))
  
    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Unauthorized Access. Your account does not exist."}), 401
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized. Wrong Password"}), 401
    if user is not None and not user.is_active:
        return jsonify({"error": "Your account has not been activated yet."}), 401  

      
    session["user_id"] = user.user_id
  
    return jsonify({
        "id": user.user_id,
        "email": user.email
    })

@login_required
@auth.route('/logout')
def logout():    
    logout_user()
    time.sleep(3)
    return redirect(url_for('main.index'))

@auth.route('/delete', methods=['POST'])
@cross_origin(supports_credentials=True)
def delete():
    email= request.json["email"]
    User.query.filter_by(email=email).first().delete()
    db.session.commit()
    #send email to user
    msg = Message('Hey your account was succesfully deleted!', sender =   'georgsinventory@gmail.com', recipients = [email])
    msg.body = "Your account has been deleted."
    mail.send(msg)

    #send email to admin
    msg2 = Message('Account deleted', sender =   'georgsinventory@gmail.com', recipients = ['lofflerg@hotmail.com'])
    msg2.body = "User " + str(email) + " has deleted his account."
    mail.send(msg2)

@auth.route('/signup', methods=['POST'])
@cross_origin(supports_credentials=True)
def signup_post():

    email = request.json["email"]
    password = request.json["password"]
    has_token = False
    forgot = request.json["forgot"]

    user_exists = User.query.filter_by(email=email).first() is not None

    user_doesn_not_exist = User.query.filter_by(email=email).first()
 
    if user_exists and forgot is False:
        return jsonify({"error": "Email already exists"}), 409
    
    if forgot is True:
        if user_doesn_not_exist is None:
            return jsonify({"error": "Pasword cannot be changed. Because Email does not exist."}), 401
            
        a_user = db.session.query(User).filter(User.email == email).one()
        hashed_password = bcrypt.generate_password_hash(password)
        a_user.password = hashed_password
        db.session.commit() 
        
        #send email to user
        msg = Message('Hey your account was succesfully updated!', sender =   'georgsinventory@gmail.com', recipients = [email])
        msg.body = "You can now log in with your new credentials"
        mail.send(msg)

        #send email to admin
        msg2 = Message('Password Change Request!', sender =   'georgsinventory@gmail.com', recipients = ['lofflerg@hotmail.com'])
        msg2.body = "User " + str(email) + " has requested password change"
        mail.send(msg2)

        session["user_id"] = a_user.user_id
 
        return jsonify({
            "id": a_user.user_id,
            "email": a_user.email
        })   
     
    else:
        hashed_password = bcrypt.generate_password_hash(password)
        new_user = User(email=email, password=hashed_password, has_token=has_token, token=None, is_active=False)
        db.session.add(new_user)
        db.session.commit()

        #send email to user
        msg = Message('Hey your account was succesfully created!', sender =   'georgsinventory@gmail.com', recipients = [email])
        msg.body = "An email has been sent to the Admin for granting you access. You'll receive an email notification once your account is active."
        mail.send(msg)
        
        #send email to admin
        msg2 = Message('New Access Request!', sender =   'georgsinventory@gmail.com', recipients = ['lofflerg@hotmail.com'])
        msg2.body = "New User " + str(email) + " has requested access for Julians Vinyl Store."
        mail.send(msg2)
    
        session["user_id"] = new_user.user_id
    
        return jsonify({
            "id": new_user.user_id,
            "email": new_user.email
        })   
