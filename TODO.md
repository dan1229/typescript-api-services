# TODO for TypeScript API Services
#### By: [Daniel Nazarian](https://danielnazarian) 🐧👹
##### Contact me at <dnaz@danielnazarian.com>

-------------------------------------------------------
## [Unreleased]
-----
### 1.1.0



#### improve duplicate catching
- add option to shut off
  - `catchDuplicates` bool
- BIG
  - find a way to include pageUrl
    - middleware or something?
  - some way we can key for `catchDuplicates` better to account for users moving between pages quickly
    - this is really more important than the amount of time, which is now a bit of a hack at only one second
  -
  - could also have it retry if the same pageUrl is hit again?
    - how to prevent just a flurry of calls spaced out by X seconds?



#### move error fields to 'message' when no 'message'?
- if no 'message' field, move some field to 'message'?
- or if default message?
  - how to figure that out?
    - maybe "None" instead of default message...?


#### timeout
- is it working lol?

    
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




### [1.1.0] - 2024-MM-DD
#### TODO

----
### 1.0.1




### [1.0.1] - 2024-02-DD
- Improved `retry/duplicate` logic
  - `retryIfNecessary` -> `catchDuplicates`
  - Improved issues with calling APIs too fast
- Fixed some bugs in `DjangoGet` methods
- Improved typing in handler classes and `DjangoApi` methods
- Improved lint - no more (unexpected) `any` types
- `console.log` lint rule added

-------------------------------------------------------

##### [https://danielnazarian.com](https://danielnazarian.com)
##### Copyright 2024 © Daniel Nazarian.