# INTERVIEW ANSWERS
## How I approached implementing the solution
To understand how to add tags to messages, I first analyzed how tags are currently used for conversations. Following a similar approach, I added a tags field (array of strings) to the ChatMessage schema. This allows tracking tags associated with each message and enables searching based on them. Here's the breakdown of what I did:

- Data Model Change: I modified the ChatMessage schema to accommodate a list for storing tags.
- Backend Logic Updates: I implemented functions for message data manipulation (e.g., addTag, removeTag, getMessagesGroupedByTags).
- Business Logic Integration: I updated the message logic layer to utilize the newly created functions for adding, removing, and finding messages by tags.
- Integration to Resolver: Finally, I integrated the add/remove functionality into the message resolvers and implemented finding messages by tags within the conversation logic.

## Problems I encountered
Here are some potential challenges I considered:

- Duplicate Tags and Empty Lists: During implementation, I addressed edge cases like empty tag lists and duplicate tags. Removing tags from empty lists was avoided, and duplicate additions were prevented by checking if the tag already exists before adding it.
- Excessive Tags per Message: While not currently implemented, a large number of tags per message could hinder search functionality. A potential solution could be a tag limit. If the limit is reached, adding a new tag would require replacing an existing one.
- Tag Validation: Currently, tags are simple strings. This allows for a wide variety of potentially unhelpful tags, making search more complex. Implementing an enumerated list of tags (enums) could be a solution.

## How I would test the solution

- Unit Tests: I wrote unit tests for the functionality related to adding, removing, and finding messages by tags (covering message.data, message.logic, and message.resolver).

- Integration Tests: I would perform integration tests to verify the entire workflow, from requesting on the endpoint to receiving the response message.

- User Testing: I would perform user testing to provide valuable insights from the user's perspective, ensuring a positive user experience.

## What I might do differently
Here are two potential improvements I identified:

- Leveraging Enums for Tags: Using enumerated types (enums) for tags would restrict them to a predefined set of valid options. This helps avoid vague or unhelpful tags, simplifies searching, and prevents users from being overwhelmed with irrelevant tags.

- Indexing Messages by Tags: I considered implementing an index on the tags field to optimize search performance. This avoids iterating through all conversation messages to find those matching specific tags.