"""$Id$"""
import os

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

class LogoProgram(db.Model):
    code = db.TextProperty()
    date = db.DateTimeProperty(auto_now_add=True)


class Papert(webapp.RequestHandler):
  def get(self):
      
    key = self.request.path.split('/',1)[1]
    
    page = os.path.join(os.path.dirname(__file__), 'index.html.tmpl')
    
    values = {'code':""}
    
    if key:
        try:
            program = db.get(key)
            if program:
                values['code'] = program.code
        except db.BadKeyError:
            pass

        
    self.response.out.write(template.render(page, values))

  def post(self):
    
    code = self.request.get('code',None)
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write("cocks\n")


    if code:
        program = LogoProgram()
        program.code = code
        program.hash = hash
        key = program.put()
    else:
        key = ""
    self.redirect("/%s"%key)
    
application = webapp.WSGIApplication([('/.*', Papert)],debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()