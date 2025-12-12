import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const { SESSIONS_TABLE, SES_FROM_ADDRESS, SES_DEFAULT_RECIPIENT } = process.env
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
const sesClient = new SESClient({ region })

export const handler = async () => {
  const now = Date.now()

  const dueReminders = await ddbClient.send(
    new QueryCommand({
      TableName: SESSIONS_TABLE,
      IndexName: undefined,
      KeyConditionExpression: 'sessionId = :placeholder AND begins_with(sortKey, :prefix)',
      ExpressionAttributeValues: {
        ':placeholder': 'SYSTEM#REMINDERS',
        ':prefix': 'reminder#',
      },
    }),
  )

  if (!dueReminders.Items?.length) {
    console.info('No reminders located')
    return { dispatched: 0 }
  }

  let dispatched = 0

  for (const reminder of dueReminders.Items) {
    const reminderTime = new Date(reminder.reminderTime).getTime()

    if (reminderTime > now) continue

    const recipient = reminder.recipient ?? SES_DEFAULT_RECIPIENT

    await sesClient.send(
      new SendEmailCommand({
        Source: SES_FROM_ADDRESS,
        Destination: { ToAddresses: [recipient] },
        Message: {
          Subject: { Data: 'Automation reminder' },
          Body: {
            Text: {
              Data: `Reminder: ${reminder.message}\nScheduled for ${new Date(
                reminder.reminderTime,
              ).toLocaleString()}`,
            },
          },
        },
      }),
    )

    await ddbClient.send(
      new UpdateCommand({
        TableName: SESSIONS_TABLE,
        Key: {
          sessionId: reminder.sessionId,
          sortKey: reminder.sortKey,
        },
        UpdateExpression: 'SET #sent = :true',
        ExpressionAttributeValues: { ':true': new Date().toISOString() },
        ExpressionAttributeNames: { '#sent': 'sentAt' },
      }),
    )

    dispatched += 1
  }

  return { dispatched }
}




