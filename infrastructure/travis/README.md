# Travis

## Setup

### OpenShift

```bash
# Create ServiceAccount
oc create sa myskills-deployer

# Assign 'edit' role
oc policy add-role-to-user edit system:serviceaccount:mydata:mydata-deployer
```
