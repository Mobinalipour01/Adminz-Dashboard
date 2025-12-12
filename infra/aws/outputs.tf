output "api_endpoint" {
  description = "Invoke URL for the chat HTTP API"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "cognito_user_pool_id" {
  description = "Cognito user pool ID for the application"
  value       = aws_cognito_user_pool.app.id
}

output "cognito_user_pool_client_id" {
  description = "User pool client ID for SPA authentication"
  value       = aws_cognito_user_pool_client.spa.id
}

output "cognito_user_pool_domain" {
  description = "Hosted Cognito auth domain"
  value       = aws_cognito_user_pool_domain.app.domain
}

output "dynamodb_table_name" {
  description = "DynamoDB table storing automation sessions and reminders"
  value       = aws_dynamodb_table.sessions.name
}

output "sns_escalation_topic_arn" {
  description = "SNS topic ARN for routed escalations"
  value       = aws_sns_topic.escalations.arn
}




