# How to do things

## Assumptions

Before you begin, this guide assumes that...

- ...you have the OpenShift CLI installed (oc) version 3.x
- ...you have a functioning OpenShift cluster
- ...you have a project namespace inside OpenShift (example: `mydata`)
- ...you have the necessary permissions inside your project namespace
- ...you have run `oc login` towards your OpenShift cluster
- ...you have set oc to use your project namespace `oc project mydata`

## Components

### Secrets

First of all, let's create some secrets that will be used in your environment.

```bash
# Replace AverySECRETtoken with your APM token
oc create secret generic apm --from-literal=token=AverySECRETtoken
# Replace aVERYsecretSECRET with your build secret
oc create secret generic github-webhook-secret --from-literal=WebHookSecretKey=aVERYsecretSECRET
# Replace the path below with a path to your TLS certificate file
oc create secret generic tls --from-file=/tmp/jtech.se.crt

# Certificates for examples/cv
openssl genrsa -out /tmp/private.pem 4096
openssl rsa -in /tmp/private.pem -outform PEM -pubout -out /tmp/public.key
openssl rsa -in /tmp/private.pem -out /tmp/private.key -outform PEM
oc create secret generic cv --from-file=/tmp/public.key --from-file=/tmp/private.key

# Docker Hub credentials (use if you wish to push images to Docker's registry)
oc create secret docker-registry dockerhub --docker-server=docker.io --docker-username=mydata --docker-password="mydata" --docker-email=code@mydata
```

### Shared resources

MyData uses `PostgreSQL` and `Redis`. Inside the `./shared` folder you will find the yaml files that describes how to deploy these.

```bash
# Deploy everything specified inside ./shared (ImageStreams + ephemeral databases)
oc apply -f shared/
```

**NOTE:** At the moment of writing this, the databases are __ephemeral__ and no data is persisted should you remove the deployments altogether.

### Deployments

There are currently two environments; __CI__ and __TEST__. The yaml files describing these are found in the `./ci` and `./test` folders respectively. Deploying or tearing down the environments are done like so:

```bash
# Deploy
oc apply -f ci/
oc apply -f test/

# Tear down
oc delete -f ci/
oc delete -f test/
```

### Other information

#### Docker Hub

The docker images are built with __TRAVIS__ and stored in __DOCKER HUB__.

- https://hub.docker.com/r/jobtechswe/mydata-app
- https://hub.docker.com/r/jobtechswe/mydata-cv
- https://hub.docker.com/r/jobtechswe/mydata-operator
