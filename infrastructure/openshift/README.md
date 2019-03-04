# How to do things

## Assumptions

Before you begin, this guide assumes that...

- ...you have the OpenShift CLI installed (oc) version 3.x
- ...you have a functioning OpenShift cluster
- ...you have created a project namespace (example: `my-data`)
- ...you have run `oc login` towards your OpenShift cluster
- ...you are set oc to use your project `oc project my-data`

## Components

### Secrets

First of all, let's create some secrets that will be used in your environment.

```bash
# Replace AverySECRETtoken with your APM token
oc create secret generic apm --from-literal=token=AverySECRETtoken
# Replace aVERYsecretSECRET with your build secret
oc create secret generic github-webhook-secret --from-literal=WebHookSecretKey=aVERYsecretSECRET
# Replace the path below with a path to your TLS certificate file
oc create secret generic tls --from-file=/home/ilix/Documents/jtech.se.crt
```

**TODO:**
`c create secret docker-registry dockerhub --docker-server=docker.io --docker-username=ilix --docker-password="nope" --docker-email=alexander@iteam.se`

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

- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv-ci/webhooks/AverySECRETtoken/github`
- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator-ci/webhooks/AverySECRETtoken/github`

#### Docker Hub

- https://hub.docker.com/r/jobtechswe/mydata-cv
- https://hub.docker.com/r/jobtechswe/mydata-operator

## TODO

- [ ] Deploy redis with storage
- [ ] Hur gör man en lokal deploy enklast?
- [ ] Kort beskrivning av vad redis, postgres, apm används till
- [ ] OpenShift-logins till Adam, Einar och Johan
- [ ] Push till Docker Hub vid bygge
- [x] Move ImageStream to its own file
- [x] Create shared CV ImageStream
- [x] Create shared Operator ImageStream
- [x] Create yaml for ephemeral redis
- [x] Create yaml for ephemeral postgres
- [x] Fix naming for stuff so that -ci and -test are in the end
- [x] Fix hostname for ci stuff (mydata-cv-ci. etc)
- [x] Deploy postgresql with storage (/lab)
- [x] Have a look at the permissions in mydata-cv Dockerfile
- [x] Byggen (cv)
- [x] Lokal test utan APM?
- [x] Vilka storage-providers finns det stöd för? (endast dropbox?)
- [x] Arbeta i develop-branch, release/test från master
- [x] GitHub webhook secret

### Nice-to-have

- [ ] Setup backup routine for redis
- [ ] Setup backup routine for postgresql

## MISC

```bash
# TL;DR; just give me some copy-pasta

# Run everything
oc apply -f shared/
oc apply -f ci/
oc apply -f test/

oc start-build cv-ci -n my-data
oc start-build operator-ci -n my-data

# Destroy everything
oc delete -f test/
oc delete -f ci/
oc delete -f shared/
```

## Test environment

```bash
chmod +x tag-test

# To tag the code and deploy to test environment, run the following:
./tag-test v0.0.1 # Where v0.0.1 is the next semver version.
```
