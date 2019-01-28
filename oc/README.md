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

### APM+ES+KIBANA

APM, ElasticSearch and Kibana.

```bash
oc apply -f apm.yml
oc apply -f kibana.yml
```

### CV

The file `cv.yml` defines an ImageStream, DeployConfiguration, Service and Route for `mydata-cv`.

```bash
oc apply -f cv.yml
```

### OPERATOR

The file `operator.yml` defines an ImageStream, DeployConfiguration, Service and Route for `mydata-operator`.

```bash
oc apply -f operator.yml
```
