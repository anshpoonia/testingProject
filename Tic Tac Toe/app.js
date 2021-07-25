const express = require('express')
const WebSocket = require('ws')
const path = require('path')
const logger = require('./logger')

const app = express()
const wss = new WebSocket.Server({port: 8080}, () => {
    console.log("Web Socket is up on port 8080")
})


app.use([logger, express.static("./")])

app.get('/', (req,res) => {
    res.sendFile(path.resolve("./index.html"))
})


let clients = {}

wss.on('connection', (ws) => {

    ws.on('message', (data) => {

        // Parsing the incoming message
        const message = JSON.parse(data)

        let messageRoomCode = message[0]
        const messageType = message[1]

        console.log(message)

        if (messageType === "first")
        {
            if (message[3] === 1)
            {
                clients.messageRoomCode = {
                    roomCode: messageRoomCode,
                    playerOne: ws,
                    playerOneName: message[2],
                    playerTwo: null,
                    playerTwoName: null,
                }
            }
            else if(message[3] === 2)
            {
                clients.messageRoomCode.playerTwo = ws;
                clients.messageRoomCode.playerTwoName = message[2]

                let tempMessage = [messageRoomCode, "otherPlayerName", clients.messageRoomCode.playerTwoName]
                clients.messageRoomCode.playerOne.send(JSON.stringify(tempMessage))

                tempMessage[2] = clients.messageRoomCode.playerOneName
                clients.messageRoomCode.playerTwo.send(JSON.stringify(tempMessage))
            }
        }

        else if (messageType === "roomCodeTest")
        {
            if(clients.messageRoomCode.roomCode === messageRoomCode)
            {
                if(clients.messageRoomCode.playerOneName === message[2] || clients.messageRoomCode.playerTwoName === message[2])
                {
                    ws.send(JSON.stringify([messageRoomCode, "You can't join the same room\nCreate a new room if you have reloaded"]))
                    console.log("1")
                }
                else if(clients.messageRoomCode.playerTwoName !== null)
                {
                    ws.send(JSON.stringify([messageRoomCode, "The room is already full"]))
                    console.log("2")
                }
                else
                {
                    ws.send(JSON.stringify([messageRoomCode, "SUCCESS"]))
                    console.log("3")
                }
            }
            else
            {
                ws.send(JSON.stringify([messageRoomCode, "Wrong Code..."]))
                console.log("4")
            }
        }
        else
        {
            clients.messageRoomCode.playerOne.send(JSON.stringify(message))
            clients.messageRoomCode.playerTwo.send(JSON.stringify(message))
        }





    })






    // let reqNum = 1
    //
    // ws.on('message', (data) => {
    //
    //     if ( reqNum === 1)
    //     {
    //         let firstMessage = JSON.parse(data)
    //         let roomCodeIncoming = firstMessage[0]
    //         let playerNameIncoming = firstMessage[1]
    //         //console.log(playerNameIncoming)
    //         reqNum = 2
    //
    //         if (rooms.roomCodeIncoming)
    //         {
    //             if ((rooms.roomCodeIncoming.length === 1) && (playerNameIncoming !== rooms.roomCodeIncoming[0]))
    //             {
    //                 //console.log('I am the second person')
    //                 rooms.roomCodeIncoming.push(playerNameIncoming)
    //
    //                 ws.roomCode = roomCodeIncoming
    //                 ws.playerName = playerNameIncoming
    //                 clients.roomCodeIncoming.push(ws)
    //
    //                 let playerNameInfo = [roomCodeIncoming,'playerNameInfo']
    //                 playerNameInfo.push(rooms.roomCodeIncoming[0])
    //                 playerNameInfo.push(rooms.roomCodeIncoming[1])
    //                 clients.roomCodeIncoming.forEach((client) => {
    //                     client.send(JSON.stringify(playerNameInfo))
    //                 })
    //             }
    //             else
    //             {
    //                 if ((rooms.roomCodeIncoming[0] === playerNameIncoming) && (rooms.roomCodeIncoming[1]))
    //                 {
    //                     //console.log(`${rooms.roomCodeIncoming[0]} with ${playerNameIncoming}`)
    //                     clients.roomCodeIncoming[0].terminate()
    //                     clients.roomCodeIncoming[0] = ws
    //
    //                     let message = [roomCodeIncoming, "reload"]
    //                     clients.roomCodeIncoming[1].send(JSON.stringify(message))
    //
    //                     let playerNameInfo = [roomCodeIncoming,'playerNameInfo']
    //                     playerNameInfo.push(rooms.roomCodeIncoming[0])
    //                     playerNameInfo.push(rooms.roomCodeIncoming[1])
    //                     clients.roomCodeIncoming[0].send(JSON.stringify(playerNameInfo))
    //
    //                     // clients.roomCodeIncoming.forEach((client) => {
    //                     //     client.send(JSON.stringify(message))
    //                     // })
    //                 }
    //                 else if ((rooms.roomCodeIncoming[1] === playerNameIncoming) && (rooms.roomCodeIncoming[0]))
    //                 {
    //                     //console.log(`${rooms.roomCodeIncoming[1]} with ${playerNameIncoming}`)
    //                     clients.roomCodeIncoming[1].terminate()
    //                     clients.roomCodeIncoming[1] = ws
    //
    //                     let message = [roomCodeIncoming, "reload"]
    //                     clients.roomCodeIncoming[0].send(JSON.stringify(message))
    //
    //                     let playerNameInfo = [roomCodeIncoming,'playerNameInfo']
    //                     playerNameInfo.push(rooms.roomCodeIncoming[0])
    //                     playerNameInfo.push(rooms.roomCodeIncoming[1])
    //                     clients.roomCodeIncoming[1].send(JSON.stringify(playerNameInfo))
    //                     // clients.roomCodeIncoming.forEach((client) => {
    //                     //     client.send(JSON.stringify(message))
    //                     // })
    //                 }
    //                 else
    //                 {
    //                     //console.log(`${playerNameIncoming} this one is terminated`)
    //                     let message = [roomCodeIncoming,"terminate"]
    //                     ws.send(JSON.stringify(message))
    //                     ws.terminate()
    //
    //                 }
    //             }
    //         }
    //         else
    //         {
    //             //console.log("room is created")
    //             rooms.roomCodeIncoming = []
    //             rooms.roomCodeIncoming.push(playerNameIncoming)
    //
    //             ws.roomCode = roomCodeIncoming
    //             ws.playerName = playerNameIncoming
    //             clients.roomCodeIncoming = []
    //             clients.roomCodeIncoming.push(ws)
    //         }
    //
    //
    //     }
    //     else
    //     {
    //         let incomingMessage = JSON.parse(data)
    //         let roomCodeIncoming = incomingMessage[0]
    //
    //         clients.roomCodeIncoming.forEach((client) => {
    //             client.send(data)
    //         })
    //     }
    //
    //
    // })

})


app.all("*",(req, res) => {
    res.status(404).send("You seem lost, brother!!")
})

app.listen(169, () => {
    console.log("Server is up on port 169")
})