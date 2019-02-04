# How to do things

These instructions assume you have OpenShift CLI installed (oc version 3.x) and that you are authenticated towards your OpenShift cluster.

## Environment scripts

### Secrets

The values of these secrets need to match your specific environment.

```bash
oc create secret generic apm --from-literal=token=meow
oc create secret generic tls --from-file=~/Documents/jtech.se.crt
```

### Shared stuff

```bash
# Deploy ephemeral redis and postgres
oc apply -f ci.yml
```

### CV

#### ImageStream

```bash
# Deploy ImageStream for latest and test tags.
oc apply -f cv-ImageStream.yml
```

#### CI

```bash
# Deploy/update
oc apply -f cv-CI.yml

# Tear down
oc delete -f cv-CI.yml
```

#### TEST

```bash
# Deploy/update
oc apply -f cv-TEST.yml

# Tear down
oc delete -f cv-TEST.yml
```

#### Build webhook

`https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv/webhooks/meow123/github`

#### GitHub

https://github.com/JobtechSwe/mydata-cv

#### Docker Hub

https://hub.docker.com/r/jobtechswe/mydata-cv

### OPERATOR

#### ImageStream

```bash
# Deploy ImageStream for latest and test tags.
oc apply -f operator-ImageStream.yml
```

#### CI

```bash
# Deploy/update
oc apply -f operator-CI.yml

# Tear down
oc delete -f operator-CI.yml
```

#### TEST

```bash
# Deploy/update
oc apply -f operator-TEST.yml

# Tear down
oc delete -f operator-TEST.yml
```

#### Build webhook

`https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator/webhooks/meow123/github`

#### GitHub

https://github.com/JobtechSwe/mydata-operator

#### Docker Hub

https://hub.docker.com/r/jobtechswe/mydata-operator

## TODO

- [x] Move ImageStream to its own file
- [x] Create shared CV ImageStream
- [x] Create shared Operator ImageStream
- [x] Create yaml for ephemeral redis
- [x] Create yaml for ephemeral postgres
- [ ] Fix naming for stuff so that -ci and -test are in the end
- [ ] Fix hostname for ci stuff (mydata-cv-ci. etc)
- [ ] Deploy redis with storage
- [ ] Deploy postgresql with storage

### Nice-to-have

- [ ] Setup backup routine for redis
- [ ] Setup backup routine for postgresql
