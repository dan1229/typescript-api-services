# TODO for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------
## [Unreleased]
-----
### 1.1.0




#### move error fields to 'message' when no 'message'?
- if no 'message' field, move some field to 'message'?
- or if default message?
  - how to figure that out?
    - maybe "None" instead of default message...?



    
#### ApiResponse error list
- instead of individual error message, include a list of any
- find some way to organize:
  - message - main message
  - messageList - full list
  - some way to identify fields or something?
    - maybe just mimic any fields django sends back?


#### ci
- add build step somehow
  - add nextjs project? idk dont want to limit this to a specific framework


-----
### 1.0.0



#### add prettier/eslint
- it's badly formatted code here!
- add eslint for imports
  - ONLY relative no absolute
  - remove tsconfig?





### [1.0.0] - 2024-MM-DD
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
#### TODO

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2024 © Daniel Nazarian.
s