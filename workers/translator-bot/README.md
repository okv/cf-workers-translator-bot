# Translator Bot

This [CloudFlare Worker](https://developers.cloudflare.com/workers/) implements a WhatsApp bot that can help you to learn some new words in different languages.

The architecture of this solution looks like this:

```mermaid
graph LR
    WhatsAppCloudAPI ==>|GET /webhook| CloudFlareWorkerEndpointGet --> VerifyTokenCheck{Is verifyToken valid?}
    VerifyTokenCheck -->|Yes| OkHTTPResponse
    VerifyTokenCheck -->|No| NonOkHTTPResponse

    WhatsAppCloudAPI -->|POST /webhook| CloudFlareWorkerEndpointPost --> SignatureCheck{Is signature valid?}
    SignatureCheck -->|Yes| SendMessage -->|POST /phoneID/messages| MetaAPIPostMessage
    SignatureCheck -->|No| NonOkHTTPResponse
```

The worker itself tries to do as less as possible and uses the following libraries:

- [packages/whatsapp](/packages/whatsapp/) to receive and send whats messages.


## Features

The bot can:

- Receive a message and say hi :wave: back :tada:
- For now that would be it :smiley:
