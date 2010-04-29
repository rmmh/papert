"""$Id: index.py 133 2009-03-26 15:31:38Z thomas.figg $"""
import os
import base64
import hashlib
import datetime 

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.api import memcache
from google.appengine.api import users

class LogoProgram(db.Model):
    code = db.TextProperty()
    img  = db.BlobProperty()
    date = db.DateTimeProperty(auto_now_add=True)
    hash = db.StringProperty()

class Moderate(webapp.RequestHandler):
    def get(self):
        login_url = users.create_login_url("/moderate")

        values = dict(login_url=login_url)

        if users.is_current_user_admin():
            values["items"] = db.GqlQuery("SELECT * FROM LogoProgram WHERE img = null").fetch(10000)

            fstring = self.request.get("filter_string", None)

            if fstring:
                values["items"] = filter(lambda x: fstring in x.code, values["items"])

            if int(self.request.get("delete", 0)):
                for item in values["items"]:
                    try:
                        item.delete()
                    except db.InternalError:
                        pass
        else:
            values["items"] = ["please log in as an admin"]

        page = os.path.join(os.path.dirname(__file__), 'moderate.html.tmpl')
        self.response.out.write(template.render(page, values))
    
application = webapp.WSGIApplication([('/moderate', Moderate)],debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
