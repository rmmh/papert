"""$Id$"""
import os

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class Papert(webapp.RequestHandler):
  def get(self):
      
    query = self.request.path.split('/',1)[1]
    
    try:
        program_id = int(query)
    except ValueError:
        program_id = 0
    
    page = os.path.join(os.path.dirname(__file__), 'index.html.tmpl')
    
    values = {}
    
    self.response.out.write(template.render(page, values))
    
application = webapp.WSGIApplication([('/.*', Papert)],debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()