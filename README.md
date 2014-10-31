nodejs-uwsgi-rpc
================

node.js uwsgi rpc library

uwsgi : universal web sockets gateway
is a modern day replacement for cgi
https://uwsgi-docs.readthedocs.org/en/latest/

it provides a language agnostic way to have applications from many different lanaguges communicate.

this library implements the uwsgi_rpc protocol so that node.js can execute registered functions
please note: the incoming and outgoing response size is limited to 64k of data, which is json encoded.

NOTE: This does not work. (YET)



