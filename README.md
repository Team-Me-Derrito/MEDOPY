# MEDOPY
Back-end and interactive display

## Back-end Setup instructions
### Dependencies and starting steps
Clone the MEDOPY repository and ensure that a recent version of Python is installed ( > 3.7) it can be installed from https://www.python.org/downloads/. This can be run using a Python environment or without. Run the following commands:<br>
```pip install Django```<br>
```pip install django-cors-headers```

After installing those packages navigate to MEDOPY/django_project/ subfolder and run the following command:<br>
```python(your version) manage.py runserver (Optional IP:port)```<br>
The back-end server should be running now. You can confirm it is running by entering that url that is provided when you run that command into your browser. There is a meaningless html file that will show but if there are no errors then the backend is running properly.


## Communal Display

Communal Display front end to allow uses to interactive be apart of a community and watch as it grows.

### Communal Display Setup
Need to have node.js installed: https://nodejs.org/en/download<br>
```cd central_app/comm_app/```<br>
```npm install```

Now make sure the back-end is setup according to the setup instructions outlined above. 
Once those steps are complete, go to:
"MEDOPY/blob/main/central_app/comm_app/public/constants/Database.js"
And change BASE_URL (line 1) to match the IP and port.

Run development server with:<br>
```npm run dev```
