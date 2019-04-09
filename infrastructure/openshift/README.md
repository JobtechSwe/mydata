# How to do things

## Assumptions

Before you begin, this guide assumes that...

- ...you have the OpenShift CLI installed (oc) version 3.x
- ...you have a functioning OpenShift cluster
- ...you have created a project namespace (example: `mydata`)
- ...you have run `oc login` towards your OpenShift cluster
- ...you are set oc to use your project `oc project mydata`

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

Both `MyData-CV` and `MyData-Operator` use PostgreSQL and Redis. These following commands will deploy instances of these to be used by the CI and TEST environments.

```bash
# Deploy shared things (ImageStreams + ephemeral databases)
oc apply -f shared/
```

### ImageStreams and automatic builds

The ImageStream and BuildConfigs are setup using the following commands.

```bash
# Deploy ImageStream for mydata-cv.
oc apply -f cv-ImageStream.yml

# Deploy ImageStream for mydata-operator
oc apply -f operator-ImageStream.yml
```

### Deployments

```bash
# Deploy CI
oc apply -f ci/

# Deploy TEST
oc apply -f test/

# Tear down
oc delete -f ci/
oc delete -f test/
```

### Other information

#### GitHub webhooks

Replace `aVERYsecretSECRET` in the URL's below (see "Secrets" section above).

- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/mydata/buildconfigs/cv-ci/webhooks/AverySECRETtoken/github`
- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/mydata/buildconfigs/operator-ci/webhooks/AverySECRETtoken/github`

#### Docker Hub

- https://hub.docker.com/r/jobtechswe/mydata-cv
- https://hub.docker.com/r/jobtechswe/mydata-operator

## MISC

```bash
# TL;DR; just give me some copy-pasta

# Run everything
oc apply -f shared/
oc apply -f ci/
oc apply -f test/

oc start-build cv-ci -n mydata
oc start-build operator-ci -n mydata

# Destroy everything
oc delete -f test/
oc delete -f ci/
oc delete -f shared/
```
