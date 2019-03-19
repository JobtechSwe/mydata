# Travis

## Setup

### Environment variables

#### Docker Hub

Add the variables **DOCKER_USER** and **DOCKER_PASS**. This user should be allowed to push images to whatever repositories you want the build to update on Docker Hub.

#### OpenShift

In order to update DeploymentConfigs in OpenShift, we use a ServiceAccount.

```bash
# Create ServiceAccount
oc create sa mydata-deployer

# Assign 'edit' role
oc policy add-role-to-user edit system:serviceaccount:mydata:mydata-deployer
```

Get the token from the first token secret belonging to this user.

```bash
oc describe sa mydata-deployer
oc describe secret myskills-deployer-token-31337
```

Grab the resulting token and save it to a variable called **OPENSHIFT_TOKEN**.
