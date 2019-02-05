# How to do things

These instructions assume you have OpenShift CLI installed (oc version 3.x) and that you are authenticated towards your OpenShift cluster.

```bash
oc project my-data # replace my-data with your actual project namespace
```

## Environment scripts

### Secrets

The values of these secrets need to match your specific environment.

```bash
oc create secret generic apm --from-literal=token=meow
oc create secret generic tls --from-file=~/Documents/jtech.se.crt
```

### Shared resources

```bash
# Deploy ephemeral redis and postgres
oc apply -f ci.yml
oc apply -f test.yml
```

### ImageStreams

```bash
# Deploy ImageStream for mydata-cv.
oc apply -f cv-ImageStream.yml

# Deploy ImageStream for mydata-operator
oc apply -f operator-ImageStream.yml
```

### Deployments

```bash
# CI
oc apply -f cv-CI.yml
oc apply -f operator-CI.yml

# TEST
oc apply -f cv-TEST.yml
oc apply -f operator-TEST.yml

# Tear down
oc delete -f cv-CI.yml
oc delete -f cv-TEST.yml
oc delete -f operator-CI.yml
oc delete -f operator-TEST.yml
```

#### Build webhooks

- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv-ci/webhooks/meow123/github`
- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv-test/webhooks/meow123/github`
- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator-ci/webhooks/meow123/github`
- `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator-test/webhooks/meow123/github`

### Source

- MyData-CV: https://github.com/JobtechSwe/mydata-cv
- MyData-Operator: https://github.com/JobtechSwe/mydata-operator

#### Docker Hub

- https://hub.docker.com/r/jobtechswe/mydata-cv
- https://hub.docker.com/r/jobtechswe/mydata-operator

## TODO

- [x] Move ImageStream to its own file
- [x] Create shared CV ImageStream
- [x] Create shared Operator ImageStream
- [x] Create yaml for ephemeral redis
- [x] Create yaml for ephemeral postgres
- [x] Fix naming for stuff so that -ci and -test are in the end
- [x] Fix hostname for ci stuff (mydata-cv-ci. etc)
- [ ] Deploy redis with storage
- [ ] Deploy postgresql with storage
- [ ] Have a look at the permissions in mydata-cv Dockerfile
- [ ] Kort beskrivning av vad redis, postgres, apm används till
- [ ] Byggen (cv)
- [ ] Lokal test utan APM?
- [ ] Hur gör man en lokal deploy enklast?
- [ ] Vilka storage-providers finns det stöd för? (endast dropbox?)
- [ ] OpenShift-logins till Adam, Einar och Johan

### Nice-to-have

- [ ] Setup backup routine for redis
- [ ] Setup backup routine for postgresql
