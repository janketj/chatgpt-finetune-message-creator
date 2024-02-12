const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const messages = []

const askForSystemMessage = () => {
  rl.question('Enter the system message: ', (systemMessage) => {
    messages.push({ role: 'system', content: systemMessage })
    askForUserMessage()
  })
}

const askForUserMessage = () => {
  rl.question('Enter the user message: ', (userMessage) => {
    messages.push({ role: 'user', content: userMessage })
    askForAssistantMessage()
  })
}

const askForAssistantMessage = () => {
  rl.question('Enter the assistant message: ', (assistantMessage) => {
    messages.push({ role: 'assistant', content: assistantMessage })
    askForAnotherMessage()
  })
}

const askForAnotherMessage = () => {
  rl.question('Do you want to add another message? (yes/no): ', (answer) => {
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
  fs.writeFileSync('messages.jsonl', messagesJson.map(JSON.stringify).join('\n'))
  console.log('File written successfully')
  rl.close()
}

askForSystemMessage()
