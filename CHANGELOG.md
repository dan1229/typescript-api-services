# CHANGELOG for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


-------------------------------------------------------

## [Released]

### [0.2.5] - 2023-05-01
- URL query param fix for `undefined` or `falsey` values


### [0.2.4] - 2023-04-25
- Lint and cleanup


### [0.2.3] - 2023-04-25
- URL API fix for Django API
- Installed `js-cookie`


### [0.2.2] - 2023-03-22
- Added 'extraHeaders' param to Django services
- Some field error processing cleanup


### [0.2.1] - 2023-02-27
- Lots of type cleanup


### [0.2.0] - 2023-02-22
- Fixed import and dependency issues
- Updated axios client in Django Api to use different headers
- Cleaned up BaseApi to be more generic than DjangoApi
- Eslint added and package set up
- CI - lint for TS
- CD - for creating branch and release


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
### 0.3.0

#### base api handler
- split up handler into django variant and a base variant
- allow for baseapi instances to use this and get general functionality
  - detect errors and use 'error' boolean
  - generic message with 'message' string


#### ci
- add build step somehow


### [0.3.0] - 2023-MM-DD
#### TODO

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2022 © Daniel Nazarian.
