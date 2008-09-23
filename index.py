"""$Id$"""
import os
import base64

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import images

class LogoProgram(db.Model):
    code = db.TextProperty()
    img  = db.BlobProperty()
    date = db.DateTimeProperty(auto_now_add=True)


class Papert(webapp.RequestHandler):
  def get(self):
      
    key = self.request.path.split('/',1)[1]
    
    if key.find('/') >=0:
        key, args = key.split('/',1)
    else:
        args = None
    
    page = os.path.join(os.path.dirname(__file__), 'index.html.tmpl')
    
    values = {'code':""}

    program = None
    
    if key:
        try:
            program = db.get(key)
        except db.BadKeyError:
            pass

    if program and args == "img":
        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(program.img)
    else:
        if program:
            values['code'] = program.code
            values['key'] = key
            
        self.response.out.write(template.render(page, values))

  def post(self):
    
    code = self.request.get('code',None)
    img = self.request.get('img',"")
    if code:
        program = LogoProgram()
        program.code = code
        if img:
            img=base64.b64decode(img)
            img = images.Image(img)
            img.resize(width = 125, height = 125)
            program.img = img.execute_transforms(output_encoding=images.PNG)
            
        key = program.put()
    else:
        key = ""
    
    self.redirect("/%s"%key)
    
application = webapp.WSGIApplication([('/.*', Papert)],debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()