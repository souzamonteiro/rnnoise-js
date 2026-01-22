#!/bin/bash

# Gere certificados SSL para desenvolvimento
openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/C=BR/ST=SaoPaulo/L=SaoPaulo/O=Dev/CN=localhost"

# Edite server.js para ativar SSL:
# config.enableSSL = true;
# node server.js