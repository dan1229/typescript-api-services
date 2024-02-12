# TODO for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------
## [Unreleased]
-----
### 1.0.0


#### move typefilters to class level
- right now you have to add them to the call itself
- it would be nice/ideal to have them at the class level



#### ApiResponse error list
- instead of individual error message, include a list of any
- find some way to organize:
  - message - main message
  - messageList - full list
  - some way to identify fields or something?
    - maybe just mimic any fields django sends back?


#### move error fields to 'message' when no 'message'?
- if no 'message' field, move all fields to 'message'?
- or if default message?
  - how to figure that out?
    - maybe "None" instead of default message...?

    
---


#### repeat api calls
- build in way to avoid multiple calling apis
- maybe a way to cancel a call if it's already in progress?
- customizable 'seconds since last call' to allow for repeat calls


#### add 'loading' property to base api?
- update at beginning and end of call
- maybe a way to cancel a call if it's already in progress?



#### ci
- add build step somehow


#### base api handler
- split up handler into django variant and a base variant
- allow for baseapi instances to use this and get general functionality
  - detect errors and use 'error' boolean
  - generic message with 'message' string
- just generally clean up error handling - it's pretty messy right now



#### ApiResponseHandler -> DjangoApiResponseHandler?
- move to new file?
- keep api response handler more generic?




### [1.0.0] - 2024-MM-DD
#### TODO

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2024 © Daniel Nazarian.
s