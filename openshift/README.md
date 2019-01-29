# How to do things

These instructions assume you have OpenShift CLI installed (oc version 3.x) and that you are authenticated towards your OpenShift cluster.

## TODO

- [x] APM container won't work
- [x] Kibana won't talk to ES
- [x] Deploy redis with ephemeral storage
- [x] Deploy postgresql with ephemeral storage
- [x] Setup ES instance outside OpenShift @JoakimVerona
- [x] Use ES instance in AF's AWS
- [ ] Ta cert från sök-api till routes
- [ ] Is it possible to store TLS certificate in a secret or similar?
- [x] Add APM_TOKEN to cv
- [x] Add APM_TOKEN to operator
- [ ] Store APM token in a secret

### Nice-to-have

- [ ] Deploy redis with storage
- [ ] Deploy postgresql with storage
- [ ] Setup backup routine for redis
- [ ] Setup backup routine for postgresql

## Environment scripts

### CV

The file `cv.yml` defines all the kubernetes and openshift objects to get the CV application up and running. 

```bash
# Deploy or update stack
oc apply -f cv.yml

# Tear down stack
oc delete -f cv.yml

# Get latest image from Docker Hub
oc import-image cv
```

GitHub webhook: `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/cv/webhooks/meow123/github`

#### Resources

**GitHub** https://github.com/JobtechSwe/mydata-cv
**Docker Hub** https://hub.docker.com/r/jobtechswe/mydata-operator

### OPERATOR

The file `operator.yml` defines an ImageStream, DeployConfiguration, Service and Route for `mydata-operator`.

```bash
oc apply -f operator.yml
```

```bash
# Get latest image from Docker Hub
oc import-image operator
```

GitHub webhook: `https://console.dev.services.jtech.se:8443/oapi/v1/namespaces/my-data/buildconfigs/operator/webhooks/meow123/github`
