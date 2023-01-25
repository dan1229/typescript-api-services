# CHANGELOG for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


-------------------------------------------------------

## [Released]

### [0.1.0] - 2023-01-13
- Architectural/structural changes to help make APIs more specific
- Broke up Django API into method APIs
- Major cleanup as well


### [0.0.1] - 2022-07-31
- Initial release!

-------------------------------------------------------

## [Unreleased]

-------------------------------------------------------
### TODO


#### ApiResponse error list
- instead of individual error message, include a list of any
- find some way to organize:
  - message - main message
  - messageList - full list
  - some way to identify fields or something?
    - maybe just mimic any fields django sends back?


#### ApiResponseHandler -> DjangoApiResponseHandler?
- move to new file?
- keep api response handler more generic?

----
### 0.1.1


#### ci/cd
- CD for releasing
  - create branch with version name
    - `version/0.1.1`
  - gh release with same version name
- CI
  - build?
  - lint?


### [0.1.1] - 2023-MM-DD
- Fixed import and dependency issues
#### TODO
- CI
- CD

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2022 © Daniel Nazarian.
