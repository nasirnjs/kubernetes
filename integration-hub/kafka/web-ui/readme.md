
**Create htpasswd file into *nginx directory* with username admin and password MySecretPass.**\
`echo "admin:$(openssl passwd -apr1 'MySecretPass')" > kafdrop.htpasswd`

`ocker-compose up -d`