const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

let messages = []
let fileName = ''
let directory = ''

const QUESTIONS = {
  fileName: 'Enter the file name for the formatted training data: ',
  directory: 'Enter the directory for the file: ',
  overwrite: 'The file already exists, do you want to overwrite it? (yes/no): ',
  append: 'Do you want to append to the file? (yes/no): ',
  systemMessage: 'Enter the system message: ',
  userMessage: 'Enter the user message: ',
  assistantMessage: 'Enter the assistant message: ',
  anotherMessage: 'Do you want to add another message? (yes/no): '
}

const initate = () => {
  // Ask for file name
  rl.question(QUESTIONS.fileName, (userFileName) => {
    fileName = userFileName
    rl.question(QUESTIONS.directory, (userDirectory) => {
      directory = userDirectory
      fs.access(`${directory}/${fileName}.jsonl`, fs.constants.F_OK, (err) => {
        if (err) {
          askForSystemMessage()
        } else {
          rl.question(QUESTIONS.overwrite, (answer) => {
            if (answer === 'yes') {
              // Don't load the file, results in overwriting
              askForSystemMessage()
            } else {
              rl.question(QUESTIONS.append, (appendAnswer) => {
                if (appendAnswer === 'yes') {
                  // Load the file and append to it
                  fs.readFile(`${directory}/${fileName}`, 'utf8', (err, data) => {
                    if (err) {
                      console.error(err)
                    } else {
                      const formattedMessages = data.split('\n').map(JSON.parse)
                      messages = formattedMessages.reduce((acc, message, index) => {
                        if (index === 0) {
                          return [
                            ...acc,
                            message.messages[0],
                            message.messages[1],
                            message.messages[2]
                          ]
                        }
                        return [...acc, message.messages[1], message.messages[2]]
                      }, [])
                      askForSystemMessage()
                    }
                  })
                } else {
                  console.log('Exiting...')
                  rl.close()
                }
              })
            }
          })
        }
      })
    })
  })
}

const askForSystemMessage = () => {
  if (messages.length > 0) {
    askForUserMessage()
    return
  }
  rl.question(QUESTIONS.systemMessage, (systemMessage) => {
    messages.push({ role: 'system', content: systemMessage })
    askForUserMessage()
  })
}

const askForUserMessage = () => {
  rl.question(QUESTIONS.userMessage, (userMessage) => {
    messages.push({ role: 'user', content: userMessage })
    askForAssistantMessage()
  })
}

const askForAssistantMessage = () => {
  rl.question(QUESTIONS.assistantMessage, (assistantMessage) => {
    messages.push({ role: 'assistant', content: assistantMessage })
    askForAnotherMessage()
  })
}

const askForAnotherMessage = () => {
  rl.question(QUESTIONS.anotherMessage, (answer) => {
    if (answer === 'yes') {
      askForUserMessage()
    } else {
      writeToFile()
    }
  })
}

const writeToFile = () => {
  const messagesJson = messages.reduce((acc, message, index) => {
    if (index % 2 !== 0) {
      return [...acc, { messages: [messages[0], messages[index], messages[index + 1]] }]
    }
    return acc
  }, [])
  // Write to file
  fs.writeFileSync(`${directory}/${fileName}.jsonl`, messagesJson.map(JSON.stringify).join('\n'))
  console.log('File written successfully')
  rl.close()
}

initate()
