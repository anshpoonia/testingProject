document.addEventListener("DOMContentLoaded", () => {

    // Storing names and room code here so that they are not stored in url or something and remember to save those in local storage
    let myName = null
    let roomCode = null
    let otherPlayerName = null
    let playerNumber = null
    let currentTurn = 'x'

    let ws = new WebSocket('ws://192.168.0.106:8080')
    ws.onopen = () => {
        console.log("Connected to WebSocket...")
    }

    // To keep the score of match won by each player
    let oScore = 0
    let xScore = 0
    let drawScore = 0

    // an array that lists all the possible winning combinations
    const winingCombinations = [
        [1,4,7],
        [2,5,8],
        [3,6,9],
        [1,2,3],
        [4,5,6],
        [7,8,9],
        [1,5,9],
        [3,5,7],
    ]
    let occupiedPosition = [0,0,0,0,0,0,0,0,0]

    // Importing all the required assets
    const startMenu = document.querySelector('.startMenu')
    const gameWindow = document.querySelector('.gameWindow')
    const playerNameWindow = document.querySelector('.playerName')
    let playerName = null
    const enteredPlayerName = document.querySelector('.enteredName')
    const joinRoomEnteredCode = document.querySelector('.codeInputBox')
    const oScoreBoard = document.querySelector('.oScore')
    const xScoreBoard = document.querySelector('.xScore')
    const oScoreBoardNum = document.querySelector('.oScoreNum')
    const xScoreBoardNum = document.querySelector('.xScoreNum')
    const drawScoreBoardNum = document.querySelector('.drawScoreNum')
    const gameBoard = document.querySelector('.gameBoard .wrapper')
    const innerBoardGameDiv = document.querySelectorAll('.innerGameBoard div')
    const winLines = document.querySelectorAll('#winLines rect')
    const oTurnDisplay = document.querySelector('.oTurn')
    const xTurnDisplay = document.querySelector('.xTurn')
    const chatsDisplayWindow = document.querySelector('.chats .wrapper')
    const chatBoxInputField = document.querySelector('.enteredChat')
    const resetGameBox = document.querySelector('.resetGameBox')
    const outComeDisplay = document.querySelector('.outComePresenter')
    const joinRoomMessage = document.querySelector('.joinRoomMessage')
    const chatWindow = document.querySelector('.chatWindow')
    const chatBoxBody = document.querySelector('.chatBoxBody')
    const chatWin = document.querySelector('.chats')

    // Importing all the images that are going to be manipulated
    const navBarIcon = document.querySelector('.navbarIcon')
    const backgroundImage = document.querySelector('.backgroundImage')

    // Importing all the buttons in use
    const createRoomButton = document.querySelector('.createRoom')
    const joinRoomButton = document.querySelector('.joinRoomButton')
    const crossStartMenuButton = document.querySelector('.crossButton')
    const sendMessageButton = document.querySelector('.sendMessage')
    //const slideButton = document.querySelector('.slideButton')
    const submitEnteredName = document.querySelector('.nameSubmit')
    const resetGameButton = document.querySelector('.resetGameButton')
    const chatWindowButton = document.querySelector('.chatWindowButton')

    // importing or declaring of components should be done about this


    createRoomButton.addEventListener('click', createRoom)
    submitEnteredName.addEventListener('click', assigningMyName)
    resetGameButton.addEventListener('click', restartGameMessage)
    joinRoomButton.addEventListener("click", joinRoom)
    chatWindowButton.addEventListener('click', openChatWindow )

    chatBoxInputField.addEventListener('keyup',(event) => {
        if(event.keyCode === 13)
        {
            event.preventDefault()
            sendMessageButton.click()
        }
    })

    joinRoomEnteredCode.addEventListener('keyup',(event) => {
        if(event.keyCode === 13)
        {
            event.preventDefault()
            joinRoomButton.click()
        }
    })

    enteredPlayerName.addEventListener('keyup',(event) => {
        if(event.keyCode === 13)
        {
            event.preventDefault()
            submitEnteredName.click()
        }
    })

    // Chat Window Opening (mobile)
    function openChatWindow()
    {
        chatWindowButton.removeEventListener('click', openChatWindow)
        chatWindowButton.classList.remove("chatWindowOpen")
        chatWindowButton.classList.remove("chatWindowButtonIcon")
        chatWindowButton.classList.remove("chatWindowButtonNotification")
        chatWindowButton.classList.add("chatWindowClose")
        chatWindowButton.classList.add("chatWindowCloseButton")
        chatWindowButton.addEventListener('click', closeChatWindow)
        chatWindow.classList.add('chatWindowExpand')
        chatWin.classList.add('chatShow')
        chatBoxBody.classList.add('chatShow')
    }

    // Closing Chat Window
    function closeChatWindow()
    {
        chatWindowButton.removeEventListener('click', closeChatWindow)
        chatWindowButton.classList.add("chatWindowOpen")
        chatWindowButton.classList.add("chatWindowButtonIcon")
        chatWindowButton.classList.remove("chatWindowClose")
        chatWindowButton.classList.remove("chatWindowCloseButton")
        chatWindowButton.addEventListener('click', openChatWindow)
        chatWindow.classList.remove('chatWindowExpand')
        chatWin.classList.remove('chatShow')
        chatBoxBody.classList.remove('chatShow')
    }


    // Sending restart game message
    function restartGameMessage()
    {
        ws.send(JSON.stringify([roomCode,"restart", myName]))
    }

    // Opening and closing of Start Menu

    function openStartMenu()
    {
        startMenu.classList.add('clipShow')
        navBarIcon.classList.add('hidden')
        navBarIcon.classList.remove('navbarIconOpen')
        navBarIcon.classList.add('navbarIconClose')
        navBarIcon.removeEventListener('click', openStartMenu)
        navBarIcon.addEventListener('click', closeStartMenu)
        crossStartMenuButton.addEventListener('click', closeStartMenu)
        gameWindow.classList.add('blur')
        backgroundImage.classList.add('blur')
    }

    function closeStartMenu()
    {
        startMenu.classList.remove('clipShow')
        setTimeout(() => {
            navBarIcon.classList.remove('hidden')

        },500)
        navBarIcon.classList.add('navbarIconOpen')
        navBarIcon.classList.remove('navbarIconClose')
        navBarIcon.addEventListener('click', openStartMenu)
        crossStartMenuButton.removeEventListener('click', closeStartMenu)
        gameWindow.classList.remove('blur')
        backgroundImage.classList.remove('blur')
    }


    // Registering the name

    function assigningMyName()
    {
        if(enteredPlayerName.value) {
            submitEnteredName.removeEventListener('click', assigningMyName)
            myName = enteredPlayerName.value
            playerNameWindow.innerHTML = "<strong><section class='nameOfPlayerHi'>Hi,</section><section class=\"nameOfPlayer\"></section></strong>"
            playerName = document.querySelector('.nameOfPlayer')
            playerName.innerText = `${myName}.`
        }
        else
        {
            enteredPlayerName.style['border'] = "yellow 3px solid"
        }
    }

    // Sending a Chat
    function sendChatMessage()
    {
        const text = chatBoxInputField.value
        chatBoxInputField.value = ""
        let message = [roomCode, "chats", playerNumber, text]
        ws.send(JSON.stringify(message))
    }


    // Printing a chat

    function printChat(num, message)
    {
        if (num === playerNumber)
        {
            const div = document.createElement('div')
            div.classList.add('sentChat')
            div.innerText = message
            chatsDisplayWindow.appendChild(div)
        }
        else if( num === "announcement")
        {
            const div = document.createElement('div')
            div.classList.add('announcement')
            if(message === roomCode)
            {
                div.innerText = `Room Code : ${message}`
            }
            else
            {
                div.innerText = `${message}`
            }

            chatsDisplayWindow.appendChild(div)
        }
        else
        {
            if(chatWindowButton.classList.contains('chatWindowOpen'))
            {
                chatWindowButton.classList.remove("chatWindowButtonIcon")
                chatWindowButton.classList.add("chatWindowButtonNotification")
            }
            const div = document.createElement('div')
            div.classList.add('receivedChat')
            div.innerText = message
            chatsDisplayWindow.appendChild(div)
        }
        chatsDisplayWindow.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    }

    // Create Room

    function createRoom()
    {
        if(roomCode && myName && playerNumber)
        {
            ws.send(JSON.stringify([roomCode, "create", myName]))
        }
        if(myName)
        {
            roomCode = "t";
            const characters = "abcdefghijklmnopqrstuvwxyz0123456789";

            for (let i = 0; i < 5; i++) {
                roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            if(playerNumber === 2) oScoreBoard.classList.remove('yourScore')
            clear()
            currentTurn = 'x'

            playerNumber = 1
            joinRoomEnteredCode.style['border'] = "none"
            turnGameOn()
        }
        else
        {
            enteredPlayerName.style['border'] = "yellow 3px solid"
        }
    }

    // Clears everything
    function clear()
    {
        sendMessageButton.removeEventListener('click', sendChatMessage)
        chatsDisplayWindow.innerText = ""
        innerBoardGameDiv.forEach((item) => {
            item.removeEventListener('click', makeTurn)
            item.classList.remove("xSymbolHover")
            item.classList.remove("oSymbolHover")
            item.classList.remove("xSymbol")
            item.classList.remove("oSymbol")
        })
    }

    // Join Room

    function joinRoom()
    {
        if(myName) {
            if(joinRoomEnteredCode.value) {
                let tempText = joinRoomEnteredCode.value
                const roomCodeCheck = [tempText, "roomCodeTest", myName]
                ws.send(JSON.stringify(roomCodeCheck))

                ws.onmessage = ((event) => {
                    let message = JSON.parse(event.data)

                    if (message[1] === "SUCCESS") {
                        if(playerNumber === 1) xScoreBoard.classList.remove('yourScore')
                        playerNumber = 2
                        roomCode = tempText
                        joinRoomMessage.innerText = ""
                        joinRoomEnteredCode.style['border'] = "none"
                        clear()
                        currentTurn = 'x'
                        turnGameOn()
                    } else {
                        joinRoomEnteredCode.value = ""
                        joinRoomMessage.innerText = `${message[1]}`
                        joinRoomEnteredCode.style['border'] = "yellow 3px solid"
                    }
                })
            }
            else
            {
                joinRoomEnteredCode.style['border'] = "yellow 3px solid"
            }
        }
        else
        {
            enteredPlayerName.style['border'] = "yellow 3px solid"
        }
    }

    // Changing turn animations

    function changeTurn()
    {
        if(currentTurn === 'o')
        {
            currentTurn = 'x'
            oTurnDisplay.classList.remove('currentTurn')
            xTurnDisplay.classList.add('currentTurn')
        }
        else
        {
            currentTurn = 'o'
            xTurnDisplay.classList.remove('currentTurn')
            oTurnDisplay.classList.add('currentTurn')
        }
    }

    // Adding X O at the selected place

    function addXO(num, position)
    {
        if ( num === 1 )
        {
            innerBoardGameDiv[position-1].classList.add('xSymbol')
            occupiedPosition[position-1] = 1
        }
        else
        {
            innerBoardGameDiv[position-1].classList.add('oSymbol')
            occupiedPosition[position-1] = 2
        }
        checkOutcome()

    }

    // Checking for win or tie

    function checkOutcome()
    {
        console.log(occupiedPosition)
        let tempNum = 0
        winingCombinations.map((combination,index) => {
            const p1 = combination[0]-1
            const p2 = combination[1]-1
            const p3 = combination[2]-1

            if((occupiedPosition[p1] === 1) && (occupiedPosition[p2] === 1) && (occupiedPosition[p3] === 1))
            {
                tempNum = 1
                xScore += 1
                xScoreBoardNum.innerText = `${xScore} wins`
                winLines[index].setAttribute("style", "clip-path: circle(100%)")

                setTimeout(() => {
                    gameBoard.classList.remove('clear')
                    gameBoard.classList.add('blur')
                    outComeDisplay.innerText = `${(playerNumber === 1)? myName: otherPlayerName} won!`
                    resetGameBox.classList.add('resetGameClipShow')
                }, 1000)

            }
            else if((occupiedPosition[p1] === 2) && (occupiedPosition[p2] === 2) && (occupiedPosition[p3] === 2))
            {
                tempNum = 1
                oScore += 1
                oScoreBoardNum.innerText = `${oScore} wins`
                winLines[index].setAttribute("style", "clip-path: circle(100%)")

                setTimeout(() => {
                    gameBoard.classList.remove('clear')
                    gameBoard.classList.add('blur')
                    outComeDisplay.innerText = `${(playerNumber === 2)? myName: otherPlayerName} won!`
                    resetGameBox.classList.add('resetGameClipShow')
                }, 1200)
            }
        })
        if((tempNum === 0) && !(occupiedPosition.includes(0)))
        {
            drawScore += 1
            drawScoreBoardNum.innerText = `${drawScore} draw`
            gameBoard.classList.remove('clear')
            gameBoard.classList.add('blur')
            outComeDisplay.innerText = `draw!`
            resetGameBox.classList.add('resetGameClipShow')
        }
    }

    // Executes turn
    function executeTurn(num, position)
    {
        addXO(num, position)
        changeTurn()

        if(currentTurn === 'x' && playerNumber === 1)
        {
            occupiedPosition.forEach((item,index) => {
                if(item === 0)
                {
                    innerBoardGameDiv[index].classList.add('xSymbolHover')
                    innerBoardGameDiv[index].addEventListener('click',makeTurn)
                }
            })
        }
        else if (currentTurn === 'o' && playerNumber === 2)
        {
            occupiedPosition.forEach((item,index) => {
                if(item === 0)
                {
                    innerBoardGameDiv[index].classList.add('oSymbolHover')
                    innerBoardGameDiv[index].addEventListener('click',makeTurn)
                }
            })
        }


    }

    // Making Turn
    function makeTurn()
    {
        const position = Number(this.getAttribute('data-id'))
        if(playerNumber === 1)
        {
            innerBoardGameDiv.forEach((item) => {
                item.removeEventListener('click', makeTurn)
                item.classList.remove('xSymbolHover')
            })
        }
        else
        {
            innerBoardGameDiv.forEach((item) => {
                item.removeEventListener('click', makeTurn)
                item.classList.remove('oSymbolHover')
            })
        }
        const message = [roomCode, 'turn', playerNumber, position]
        ws.send(JSON.stringify(message))
    }

    // Restart game

    function restartGame()
    {
        changeTurn()
        resetGameBox.classList.remove('resetGameClipShow')
        gameBoard.classList.remove('blur')
        gameBoard.classList.add('clear')
        for(let i = 0 ; i < 9 ; i++)
        {
            occupiedPosition[i] = 0
        }
        winLines.forEach((item) => {
            item.removeAttribute("style")
        })
        innerBoardGameDiv.forEach((item) => {
            item.removeEventListener('click',makeTurn)
            item.classList.remove('xSymbol')
            item.classList.remove('oSymbol')
            item.classList.remove('xSymbolHover')
            item.classList.remove('oSymbolHover')
        })
        if(currentTurn === 'x' && playerNumber === 1)
        {
            innerBoardGameDiv.forEach((item) => {
                item.addEventListener('click', makeTurn)
                item.classList.add('xSymbolHover')
            })
        }
        else if (currentTurn === 'o' && playerNumber === 2)
        {
            innerBoardGameDiv.forEach((item) => {
                item.addEventListener('click', makeTurn)
                item.classList.add('oSymbolHover')
            })
        }
    }

    // Start Game
    function initialStartGame()
    {
        changeTurn()
        innerBoardGameDiv.forEach((item,index) => {
            item.setAttribute('data-id', `${index+1}`)
        })
        if(playerNumber === 2)
        {
            innerBoardGameDiv.forEach((item) => {
                item.addEventListener('click', makeTurn)
                item.classList.add('oSymbolHover')
            })
        }
    }

    // Websocket and sending and receiving messages

    function turnGameOn()
    {
        if (myName && roomCode) {

            const firstMessage = [roomCode, "first", myName, playerNumber]
            ws.send(JSON.stringify(firstMessage))

            navBarIcon.addEventListener('click', openStartMenu)
            navBarIcon.classList.add('navbarIconOpen')
            backgroundImage.classList.remove('blur')
            gameWindow.classList.remove('blur')
            startMenu.classList.remove('clipShow')


            setTimeout(() => {
                printChat("announcement", roomCode)
                crossStartMenuButton.classList.remove('hidden')
                navBarIcon.classList.remove('hidden')
            }, 1000)

            if(playerNumber === 1)
            {
                setTimeout(() => {
                    xScoreBoard.classList.add('yourScore')
                    oTurnDisplay.classList.add('currentTurn')
                }, 2000)
            }
            else if(playerNumber === 2)
            {
                setTimeout(() => {
                    oScoreBoard.classList.add('yourScore')
                    oTurnDisplay.classList.add('currentTurn')
                }, 2000)
            }


            ws.onmessage = ((event) => {

                let message = JSON.parse(event.data)
                let typeMessage = message[1]

                if (typeMessage === "otherPlayerName")
                {
                    otherPlayerName = message[2]
                    sendMessageButton.addEventListener('click', sendChatMessage)

                    setTimeout(() => {
                        printChat("announcement", `${otherPlayerName} has joined`)
                        printChat("announcement", "The game has started")
                    },1500)

                    initialStartGame()
                }

                else if( typeMessage === "turn")
                {
                    const tempNum = message[2]
                    const tempPosition = message[3]
                    executeTurn(tempNum, tempPosition)
                }

                else if ( typeMessage === "chats")
                {
                    const temp = message[2]
                    const chat = message[3]
                    printChat(temp, chat)
                }

                else if( typeMessage === "restart")
                {
                    printChat("announcement", `${message[2]} has restarted the game`)
                    restartGame()
                }

                else if( typeMessage === "create")
                {
                    if(message[2] !== myName)
                    {
                        printChat("announcement", `${otherPlayerName} has created another room`)
                    }
                }


            })
        }
    }



    // Test



})