# flask_inventory

## Description

Inventory as Full-Stack project with Admin and User Management, API Request, and Data Management via Categories and Subcategories (Filter, Excel and PDF Export).


![alt text](https://github.com/geoloe/flask_inventory/blob/432e4d592afa07de4b0bb2862ffd20206d1887dd/inventory_demo.png "Example UI")


Sidenote: This project was developed for personal use and is still under development.

## Requisites:
* Linux OS
* Python 3.8.10
* Conda
* Node.JS
* npm
* MySQL 8.0 or higher

### This guide is only for the development process!
## Deployment Steps for development:

1. Clone Repository
2. Install [Anaconda](https://docs.continuum.io/free/anaconda/install/linux/) 
3. Create a conda enviroment for the project with python 3.8.10

    `conda create -n myenv python=3.8.10`
    
    `conda activate`
    
4. Install pip
5. Install python modules via requirements.txt

    `pip install -r requirements.txt`
    
6. Check packages install in the enviroment you just created

    `pip freeze`
    
7. Install [npm and Node.JS](https://www.geeksforgeeks.org/installation-of-node-js-on-linux/)
8. Install Node.JS modules and dependencies via `package.json`

    `cd flask_inventory/nodejs`
    
    `npm install`
    
9. Install Mysql

    Create DB called "inventory"
    
    Create User and Privileges for that DB
    
    Use DB Credentials in __init__.py
    
10. Define Flask Variables:

    `export FLASK_APP=flask_inventory`
    
    `export FLASK_ENV=dev`
    
    `export FLASK_DEBUG=1`
    
    `flask run -h <your ip-address>`

*For installing bulma packages you will need to install the specific module via npm then define its .sass location in your .scss file to compile css Code*
