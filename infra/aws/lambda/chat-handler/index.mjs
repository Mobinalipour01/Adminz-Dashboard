import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { v4 as uuid } from 'uuid'

const {
  SESSIONS_TABLE,
  EVENT_BUS_NAME,
  SES_FROM_ADDRESS,
  SES_DEFAULT_RECIPIENT,
} = process.env

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
const eventBridge = new EventBridgeClient({ region })
const sesClient = new SESClient({ region })

const ROUTED_TOPICS = {
  escalation: 'support-escalation',
  reminder: 'automation-reminder',
}

const intents = [
  {
    key: 'setReminder',
    match: /(set|create|schedule).*(reminder|follow[- ]?up|alert)/i,
    handler: handleSetReminder,
  },
  {
    key: 'viewReminders',
    match: /(show|list|view).*(reminder|follow[- ]?up|alert)/i,
    handler: handleViewReminders,
  },
  {
    key: 'deleteReminder',
    match: /(delete|remove|cancel).*(reminder|follow[- ]?up|alert)/i,
    handler: handleDeleteReminder,
  },
  {
    key: 'escalate',
    match: /(escalat|urgent|critical|handover)/i,
    handler: handleEscalation,
  },
]

export const handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { sessionId = uuid(), message = '', user = {} } = body

    if (!message.trim()) {
      return response(400, { error: 'Message cannot be empty.' })
    }

    const matchedIntent = intents.find((intent) => intent.match.test(message))

    if (!matchedIntent) {
      return response(200, {
        sessionId,
        reply:
          "I'm your automation helper. I can set reminders, list or delete them, or escalate issues. Try saying “Set a reminder for tomorrow at 9am to check the deployment.”",
      })
    }

    const result = await matchedIntent.handler({ sessionId, message, user })
    return response(200, { sessionId, ...result })
  } catch (error) {
    console.error('chat-handler error', error)
    return response(500, { error: 'Something went wrong processing your request.' })
  }
}

function response(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(payload),
  }
}

async function handleSetReminder({ sessionId, message, user }) {
  const reminderId = uuid()
  const reminderTime = deriveReminderTime(message)

  await ddbClient.send(
    new PutCommand({
      TableName: SESSIONS_TABLE,
      Item: {
        sessionId,
        sortKey: `reminder#${reminderId}`,
        type: 'reminder',
        message,
        reminderId,
        reminderTime,
        createdAt: new Date().toISOString(),
        expiresAt: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
    }),
  )

  await eventBridge.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EVENT_BUS_NAME,
          Source: 'automation.bot',
          DetailType: 'ReminderCreated',
          Detail: JSON.stringify({
            sessionId,
            reminderId,
            reminderTime,
            message,
            user,
          }),
        },
      ],
    }),
  )

  return {
    reply: `Got it. I set a reminder for ${reminderTime.toLocaleString()}. I'll notify you when it's due.`,
  }
}

async function handleViewReminders({ sessionId }) {
  const data = await ddbClient.send(
    new QueryCommand({
      TableName: SESSIONS_TABLE,
      KeyConditionExpression: 'sessionId = :sessionId AND begins_with(sortKey, :reminderPrefix)',
      ExpressionAttributeValues: {
        ':sessionId': sessionId,
        ':reminderPrefix': 'reminder#',
      },
    }),
  )

  if (!data.Items?.length) {
    return { reply: 'You have no reminders scheduled.' }
  }

  const lines = data.Items.map((item) => {
    const time = new Date(item.reminderTime).toLocaleString()
    return `• ${time} — ${item.message}`
  })

  return {
    reply: `Here are your active reminders:\n${lines.join('\n')}`,
  }
}

async function handleDeleteReminder({ sessionId, message }) {
  const reminderId = extractReminderId(message)

  if (!reminderId) {
    return {
      reply: 'Please specify which reminder to delete. For example: “Delete reminder 1234.”',
    }
  }

  await ddbClient.send(
    new PutCommand({
      TableName: SESSIONS_TABLE,
      Item: {
        sessionId,
        sortKey: `removal#${reminderId}`,
        type: 'removal',
        reminderId,
        createdAt: new Date().toISOString(),
      },
    }),
  )

  return {
    reply: `Acknowledged. I marked reminder ${reminderId} to be removed.`,
  }
}

async function handleEscalation({ sessionId, message, user }) {
  const email = user.email || SES_DEFAULT_RECIPIENT

  await sesClient.send(
    new SendEmailCommand({
      Source: SES_FROM_ADDRESS,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Automation escalation request' },
        Body: {
          Text: {
            Data: `Session ${sessionId} requested an escalation.\n\nMessage:\n${message}`,
          },
        },
      },
    }),
  )

  return {
    reply: 'Escalation request sent. A support engineer will follow up shortly.',
    topic: ROUTED_TOPICS.escalation,
  }
}

function deriveReminderTime(message) {
  const match = message.match(/(tomorrow|today|\d{1,2}(:\d{2})?\s?(am|pm)?)/i)
  const base = new Date()

  if (match?.[0]?.toLowerCase() === 'tomorrow') {
    base.setDate(base.getDate() + 1)
    base.setHours(9, 0, 0, 0)
    return base
  }

  if (match?.[0]?.toLowerCase() === 'today') {
    base.setHours(17, 0, 0, 0)
    return base
  }

  return new Date(base.getTime() + 60 * 60 * 1000)
}

function extractReminderId(message) {
  const match = message.match(/reminder\s+([a-f0-9-]{6,})/i)
  return match?.[1]
}




