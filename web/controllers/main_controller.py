from flask import render_template

from web import app, register_asset


register_asset('stylesheets',
               'stylesheets/css/normalize.css',
               'stylesheets/css/bootstrap.css',
               'stylesheets/css/font-awesome.css')

register_asset('header_scripts',
               'scripts/vendor/modernizr.js')

register_asset('body_scripts')


@app.route('/')
def index():
    return render_template('main.html')
