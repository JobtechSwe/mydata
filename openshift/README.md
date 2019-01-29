# How to do things

These instructions assume you have OpenShift CLI installed (oc version 3.x) and that you are authenticated towards your OpenShift cluster.

## Environment scripts

### Secrets

```bash
oc create secret generic apm --from-literal=token=meow
oc create secret generic tls --from-file=~/Documents/jtech.se.crt
```

### CV

#### cv.yml

```bash
# Deploy/update
oc apply -f cv.yml

# Tear down
oc delete -f cv.yml

# Get latest image from Docker Hub
oc import-image cv
```

#### Build webhook

`https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv/webhooks/meow123/github`

#### GitHub

https://github.com/JobtechSwe/mydata-cv

#### Docker Hub

https://hub.docker.com/r/jobtechswe/mydata-cv

### OPERATOR

#### operator.ym

```bash
# Deploy/update
oc apply -f operator.yml

# Tear down
oc delete -f operator.yml

# Get latest image from Docker Hub
oc import-image operator
```

#### Build webhook

`https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator/webhooks/meow123/github`

#### GitHub

https://github.com/JobtechSwe/mydata-operator

#### Docker Hub

https://hub.docker.com/r/jobtechswe/mydata-operator

## TODO

- [ ] -

### Nice-to-have

- [ ] Deploy redis with storage
- [ ] Deploy postgresql with storage
- [ ] Setup backup routine for redis
- [ ] Setup backup routine for postgresql
