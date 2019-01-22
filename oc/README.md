# How to do things

These instructions assume you have OpenShift CLI installed (oc version 3.x) and that you are authenticated towards your OpenShift cluster.

## CV

The file `cv.yml` defines an ImageStream, DeployConfiguration, Service and Route for `mydata-cv`.

```bash
oc apply -f cv.yml
```
