# Libp2p Nodejs Router Example

A starter project for routing messages from local services/apps to a remote libp2p peer

## Usage

Run `node index.js`

## Sending messages

Router listens on port 8081 for incoming POST requests with a body structured like below and routes the value associated with the `message` key in the body to a remote libp2p peer.

```js
{
    'message':'{your message here}'
}
```

