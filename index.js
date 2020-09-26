'use strict'

const libp2p = require('libp2p')
const WS = require('libp2p-websockets')
const WStar = require('libp2p-webrtc-star')
const { NOISE } = require('libp2p-noise')
const PeerID = require('peer-id')
const mplex = require('libp2p-mplex')
const chat = require('./chat')
const wrtc = require('wrtc')
const http = require('http')
const Stream = require('stream')
const { parse } = require('querystring');
const multiaddr = require('multiaddr')

const pipe = require('it-pipe')
const { peerId } = require('libp2p/src/circuit')
const transportKey = WStar.prototype[Symbol.toStringTag]
const readableStream = new Stream.Readable()
readableStream._read = function () { };


var server = http.createServer((function (req, res) {
    console.log(req.method)
    if (req.method == "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(
                JSON.parse(body)
            );
            res.end('ok');
            readableStream.push(JSON.parse(body)["message"])
        });
    }
    
}));

function send(stream) {
    pipe(
        // Read from readableStream (the source)
        readableStream,
        // Write to the stream (the sink)
        stream.sink
    )
}




const options = {
    modules: {
        transport: [WS, WStar],
        connEncryption: [NOISE],
        streamMuxer: [mplex],
    },
    addresses: {
        listen: ['/ip4/192.168.1.194/tcp/13579/wss/p2p-webrtc-star'],
    },
    config: {
        transport: {
            [transportKey]: {
                wrtc
            }
        }
    }
}

const mobilePeerAddress = 'QmVivjNxfi2R1ooX8CTMWyei9JRhHcngevE9Pw585zJj99'
async function dialPeer(node) {
    let remotePeerId = await PeerID.createFromB58String(mobilePeerAddress)
    let remoteMultiaddr = node.peerStore.addressBook.getMultiaddrsForPeer(remotePeerId)
    let dialerAddress = ''
    console.log(remoteMultiaddr)
    if (remoteMultiaddr.length > 0) {
        dialerAddress = remoteMultiaddr[0]
    }
    else dialerAddress = remoteMultiaddr
    console.log(dialerAddress.toString())
    if (remoteMultiaddr) {
        const { stream } = await node.dialProtocol(dialerAddress.toString(), chat.PROTOCOL)
        send(stream)
    }
}

const main = async () => {
    let nodeId = await PeerID.create({ bits: 1024, keyType: 'rsa' })
    options.peerId = nodeId
    let node = await libp2p.create(options)

    await node.handle(chat.PROTOCOL, async ({ stream }) => {
        chat.receive(stream)
    })

    node.connectionManager.on('peer:connect', async (connection) => {
        console.log('connected to: ', connection.remotePeer.toB58String())
        let addr = connection.remoteAddr
        if (connection.remotePeer.toB58String() == mobilePeerAddress)
        try {
            await dialPeer(node)
        }
        catch (err) {
            console.log(err)
        }
    })
    await node.start();
    console.log('Node started!')
    console.log(`listening on: ${node.peerId.toB58String()}`)
}

server.listen(8081)
main()