# TODO for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------
## [Unreleased]
-----
### 1.1.0


#### ci
- add build step somehow




#### move error fields to 'message' when no 'message'?
- if no 'message' field, move some field to 'message'?
- or if default message?
  - how to figure that out?
    - maybe "None" instead of default message...?

    
-----
### 1.0.0




#### ApiResponse error list
- instead of individual error message, include a list of any
- find some way to organize:
  - message - main message
  - messageList - full list
  - some way to identify fields or something?
    - maybe just mimic any fields django sends back?



---


#### repeat api calls
- build in way to avoid multiple calling apis
- maybe a way to cancel a call if it's already in progress?
- customizable 'seconds since last call' to allow for repeat calls


----


#### move typefilters to class level
- right now you have to add them to the call itself
- it would be nice/ideal to have them at the class level



#### add 'loading' property to base api?
- update at beginning and end of call
- maybe a way to cancel a call if it's already in progress?







### [1.0.0] - 2024-MM-DD
- Created `BaseApiResponseHandler` and `DjangoApiResponseHandler` for more functionality
  - Much more modular and customizable
  - Cleaned up `DjangoApiResponseHandler` error handling
- General support for `BaseApi` improved
- `DjangoApi.post` - `extraHeaders` param fixed
- Added `loading` property to `BaseApi` and `DjangoApi` for loading state
#### TODO

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2024 © Daniel Nazarian.
s