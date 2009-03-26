"""$Id$"""
import os
import base64
import sha
import datetime 

from google.appengine.ext.webapp import template
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.api import memcache

class LogoProgram(db.Model):
    code = db.TextProperty()
    img  = db.BlobProperty()
    date = db.DateTimeProperty(auto_now_add=True)
    hash = db.StringProperty()

class Papert(webapp.RequestHandler):
    def get(self):
        hash = self.request.path[1:9] #this assumes that hashes are always 8 chars
        extra = self.request.path[9:]

        if extra == ".png" and hash == self.request.headers.get('If-None-Match'):
            self.response.set_status(304)
            return

        if extra not in ('', '.png'):
            self.redirect('/')
            return

        older = self.request.get("older")
        newer = self.request.get("newer")

        program = None

        if hash:
            program = memcache.get("program: %s" % hash)
            if program is None:
                program = LogoProgram.all().filter('hash = ', hash).get()
                if program is None:
                    memcache.set("program: %s" % hash, "not found")
                else:
                    memcache.set("program: %s" % hash, program)

            if program == "not found":
                program = None

            if program is None:
                self.redirect('/')

        if program and extra == ".png":
            self.response.headers['Content-Type'] = 'image/png'
            self.response.headers['Cache-Control'] = 'max-age:604800'
            self.response.headers['Etag'] = program.hash
            self.response.headers['Last-Modified'] = program.date.ctime()
            self.response.out.write(program.img)
        else:
            values = {'code':""}
            if program:
                values['code'] = program.code
                values['hash'] = hash
        
       
            if older or newer:
                    if older:
                        browse_date = datetime.datetime.strptime(older,"%Y-%m-%dT%H:%M:%S")
                        recent = LogoProgram.all().filter('date <', browse_date).order('-date').fetch(5)
                    else:
                        browse_date = datetime.datetime.strptime(newer,"%Y-%m-%dT%H:%M:%S")
                        recent = LogoProgram.all().filter('date >', browse_date).order('date').fetch(5)
                        if recent:
                            recent.reverse()
                    if recent:
                        values['recent'] = [program.hash for program in recent]
                        values['last_date'] = recent[-1].date.strftime("%Y-%m-%dT%H:%M:%S")
                        values['next_date'] = recent[0].date.strftime("%Y-%m-%dT%H:%M:%S")
            else:
                recent = memcache.get("recent_scripts")
                last_date = memcache.get("last_script_date")
                if recent is None or last_date is None:
                    recent = LogoProgram.all().order('-date').fetch(5)
                    if recent:
                        last_date = recent[-1].date.strftime("%Y-%m-%dT%H:%M:%S")
                        recent = [program.hash for program in recent]
                        memcache.set("recent_scripts", recent)
                        memcache.set("last_script_date", last_date)
                        values['recent'] =  recent
                        values['last_date'] =  last_date

            page = os.path.join(os.path.dirname(__file__), 'index.html.tmpl')
            self.response.out.write(template.render(page, values))

    def post(self):
        code = self.request.get('code',None)
        img = self.request.get('img',"")

        if code.strip():
            hash = base64.b64encode(sha.sha(code.strip()).digest()[:6], "-_")
            if not LogoProgram.all().filter('hash =', hash).get():
                program = LogoProgram()
                program.code = code
                program.hash = hash
                if img:
                    img = base64.b64decode(img)
                    img = images.Image(img)
                    img.resize(125, 125)
                    program.img = img.execute_transforms()
                program.put()
                memcache.set("program: %s" % hash, program)
                memcache.delete("recent")
        else:
            hash = ""
    
        self.redirect("/%s" % hash)
    
application = webapp.WSGIApplication([('/.*', Papert)],debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
