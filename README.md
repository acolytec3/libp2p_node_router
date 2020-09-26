# Libp2p Nodejs Router Example

A starter project for routing messages from local services/apps to a remote libp2p peer.  

This project is intended to be paired with [this web/mobile app](https://github.com/acolytec3/lios)

## Usage

Run `node index.js`

### webRTC STAR server 

As currently configured, this app is looks for a [webRTC STAR server running on your local network](https://github.com/libp2p/js-libp2p-webrtc-star#rendezvous-server-aka-signaling-server).  Set additional remote STAR servers (e.g. `/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star`) as desired.  Update the IP address in the `addresses` section of the `options` object with the address of your STAR server and adjust the multiaddress as required

### Remote peer

Change the value of `mobilePeerAddress` to the B58 String representing the public key of whatever libp2p peer you want the router to send messages to.

## Sending messages

The router listens on port 8081 for incoming POST requests looking for a key/value pair structured like below and routes the value associated with the `message` key in the body to a remote libp2p peer.

```js
{
    'message':'{your message here}'
}
```

