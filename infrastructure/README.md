# Infrastructure

## Overview

### Continuous Integration/Delivery

Each code change needs to be made via a separate branch and then merged via a [Pull Request](https://github.com/JobtechSwe/mydata/pulls). Pull requests need to be approved manually as well as approved via automatic checks.

Automatic checks are done with __Travis CI__ as defined in [.travis.yml](https://github.com/JobtechSwe/mydata/blob/docs/infrastructure/.travis.yml) in the root of this repository.

When the __master__ branch is updated as well as successfully built and deployed the resulting docker images are deployed inside __OpenShift__ in the __CI__ environment.

Whenever a __git tag__ is created and pushed, the __TEST__ environment is updated rather than the __CI__ environment.

### Versioning

This monorepo uses __lerna__ to manage its different components.

## Deep-dive

[OpenShift](https://github.com/JobtechSwe/mydata/tree/docs/infrastructure/infrastructure/openshift)

[Travis](https://github.com/JobtechSwe/mydata/tree/docs/infrastructure/infrastructure/travis)
