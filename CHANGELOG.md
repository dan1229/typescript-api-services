# CHANGELOG for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


-------------------------------------------------------

## [Released]

### [1.0.7] - 2024-10-11
- Fixed `pageCurrent` not being set properly for all responses
- General `get` API response handling bug fixes


### [1.0.6] - 2024-06-17
- Duplciate API catching improvements
  - Previously successful API calls were being caught as duplicates
  - Duplicate responses now include the last successful response data in case that's what the client accidentally uses
  - Remove `ApiResponseDuplicate` and replace with `duplicate` field

  
### [1.0.5] - 2024-06-15
- Fixed `errorFields` not being set properly for all responses
- CD branch creation clean up / fix


### [1.0.4] - 2024-03-24
- Django `get` API response handling bug


### [1.0.3] - 2024-03-24
- Logging improvements


### [1.0.2] - 2024-03-17
- Fix for `DjangoGet` APIs related to paginated APIs
  - Wasn't handling `next` and `previous` links correctly


### [1.0.1] - 2024-02-15
- Improved `retry/duplicate` logic
  - `retryIfNecessary` -> `catchDuplicates`
  - Improved issues with calling APIs too fast
- Fixed some bugs in `DjangoGet` methods
- Improved typing in handler classes and `DjangoApi` methods
- Improved lint - no more (unexpected) `any` types
- `console.log` lint rule added


### [1.0.0] - 2024-02-14
- Added automatic call limiting/retrying to `BaseApi` and `DjangoApi`
  - Ability to choose amount of time
- Created `BaseApiResponseHandler` and `DjangoApiResponseHandler` for more functionality
  - Much more modular and customizable
  - Cleaned up `DjangoApiResponseHandler` error handling
- General support for `BaseApi` improved
- `DjangoApi.post` - `extraHeaders` param fixed
- Added `loading` property to `BaseApi` and `DjangoApi` for loading state
- `TypeFilter` added to `BaseApi` and `DjangoApi` for type filtering
  - Moved 'up' from method level to class level
- Improved linting to help prevent some errors
- Added `prettier` to help with code formatting


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

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2024 © Daniel Nazarian.
